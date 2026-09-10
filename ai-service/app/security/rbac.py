from enum import Enum
from functools import wraps
from typing import Any, Callable, List, Optional, Set, Union
from fastapi import Depends, HTTPException, Request, status

from app.models.audit_log import AuditAction, AuditStatus
from app.security.audit import audit_service
from app.security.auth import TenantContext, User, get_current_user, get_tenant_context


class UserRole(str, Enum):
    OWNER = "Owner"
    MANAGER = "Manager"
    OPERATOR = "Operator"
    QA = "QA"
    CUSTOMER = "Customer"


# Role Permission Hierarchy / Matrix
ROLE_PERMISSIONS = {
    UserRole.OWNER: {
        "all",
        "manage_users",
        "read_orders", "write_orders",
        "read_inventory", "write_inventory",
        "read_machines", "write_machines",
        "read_rfq", "write_rfq",
        "read_quotations", "write_quotations",
        "read_production", "write_production",
        "read_qc", "write_qc",
        "read_audits"
    },
    UserRole.MANAGER: {
        "read_orders", "write_orders",
        "read_inventory", "write_inventory",
        "read_machines",
        "read_rfq", "write_rfq",
        "read_quotations", "write_quotations",
        "read_production", "write_production",
        "read_qc",
        "read_audits"
    },
    UserRole.OPERATOR: {
        "read_machines", "write_machines",  # restricted to assigned machines
        "read_production",
        "read_rfq"
    },
    UserRole.QA: {
        "read_orders",
        "read_inventory",
        "read_machines",
        "read_rfq",
        "read_quotations",
        "read_production",
        "read_qc", "write_qc"  # QC operations sign-off
    },
    UserRole.CUSTOMER: {
        "read_orders",  # restricted to own orders
        "read_rfq",     # restricted to own RFQs
        "read_quotations"
    }
}


def normalize_role(role: Union[str, UserRole]) -> str:
    """Normalizes role strings to TitleCase (e.g. 'owner' -> 'Owner')."""
    role_str = role.value if isinstance(role, UserRole) else str(role)
    role_lower = role_str.strip().lower()
    for standard_role in UserRole:
        if standard_role.value.lower() == role_lower:
            return standard_role.value
    # Fallback mappings for legacy headers
    if role_lower in ["factory_admin", "admin"]:
        return UserRole.OWNER.value
    return role_str.capitalize()


class RoleChecker:
    """
    FastAPI dependency that enforces RBAC and tenant isolation.
    Usage:
        user: User = Depends(RoleChecker(["Manager", "Owner"]))
    """
    def __init__(self, allowed_roles: List[Union[str, UserRole]]):
        self.allowed_roles = [normalize_role(r) for r in allowed_roles]

    async def __call__(
        self,
        current_user: User = Depends(get_current_user)
    ) -> User:
        user_role_norm = normalize_role(current_user.role)
        is_owner = (user_role_norm == UserRole.OWNER.value)
        
        # Check if user role matches allowed roles, or is Owner
        if user_role_norm not in self.allowed_roles and not is_owner:
            audit_service.record_event(
                user_id=current_user.user_id,
                user_role=current_user.role,
                tenant_id=current_user.tenant_id,
                action=AuditAction.SECURITY_VIOLATION,
                resource="RBAC_CHECK",
                details=f"Access denied. User has role '{current_user.role}', required: {self.allowed_roles}",
                status=AuditStatus.BLOCKED
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Insufficient privileges. Required role(s): {', '.join(self.allowed_roles)}"
            )

        return current_user


def require_role(*roles: Union[str, UserRole]):
    """
    Decorator for route endpoints:
    @require_role("Manager", "Owner")
    async def update_order(...):
    """
    allowed = [normalize_role(r) for r in roles]

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Locate user or tenant from kwargs
            user: Optional[User] = kwargs.get("current_user")
            tenant: Optional[TenantContext] = kwargs.get("tenant")

            role_to_check = None
            if user:
                role_to_check = normalize_role(user.role)
            elif tenant and tenant.user_role:
                role_to_check = normalize_role(tenant.user_role)

            is_owner = (role_to_check == UserRole.OWNER.value)
            if not role_to_check or (role_to_check not in allowed and not is_owner):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Forbidden: Action requires one of roles: {', '.join(allowed)}"
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator


def verify_tenant_access(current_user: User, target_tenant_id: str):
    """
    Enforces cross-factory multi-tenant isolation.
    User A (factory_acme_01) CANNOT view or mutate User B's (factory_rival_02) data.
    """
    if current_user.tenant_id != target_tenant_id:
        audit_service.record_event(
            user_id=current_user.user_id,
            user_role=current_user.role,
            tenant_id=current_user.tenant_id,
            action=AuditAction.SECURITY_VIOLATION,
            resource=f"TENANT_{target_tenant_id}",
            details=f"Cross-tenant isolation violation: User from '{current_user.tenant_id}' attempted to access '{target_tenant_id}'",
            status=AuditStatus.BLOCKED
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Multi-tenant boundary violation. You do not have access to this factory's data."
        )


def verify_operator_machine_assignment(current_user: User, machine_id: str):
    """
    Ensures an Operator can only operate on machines explicitly assigned to them.
    Owners and Managers have broad access across all machines.
    """
    if normalize_role(current_user.role) == UserRole.OPERATOR.value:
        if machine_id not in current_user.assigned_machines:
            audit_service.record_event(
                user_id=current_user.user_id,
                user_role=current_user.role,
                tenant_id=current_user.tenant_id,
                action=AuditAction.SECURITY_VIOLATION,
                resource=f"MACHINE_{machine_id}",
                details=f"Operator {current_user.user_id} attempted unauthorized access to unassigned machine {machine_id}",
                status=AuditStatus.BLOCKED
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Operator is not assigned to machine '{machine_id}'. Assigned: {current_user.assigned_machines}"
            )


def verify_customer_order_ownership(current_user: User, order_customer_id: str):
    """
    Ensures a Customer can only access their own orders.
    """
    if normalize_role(current_user.role) == UserRole.CUSTOMER.value:
        if current_user.customer_id != order_customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Customers may only view their own orders."
            )
