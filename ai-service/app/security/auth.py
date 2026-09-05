from typing import Optional
from fastapi import Header, HTTPException, Security, status
from pydantic import BaseModel
from app.config.settings import settings

class TenantContext(BaseModel):
    org_id: str
    user_id: Optional[str] = 'system'
    user_role: Optional[str] = 'operator'
    customer_id: Optional[str] = None  # populated if request is from Buyer/Customer Portal
    is_admin: bool = False

async def verify_service_key(
    x_service_key: Optional[str] = Header(None, alias='X-Service-Key')
) -> bool:
    """Verifies that the request originates from an authorized ForgeIQ service."""
    if not settings.AI_SERVICE_API_KEY:
        return True
    
    if not x_service_key or x_service_key != settings.AI_SERVICE_API_KEY:
        # In development/test mode allow fallback if matching default
        if settings.ENVIRONMENT == 'development' and (not x_service_key or x_service_key == 'forgeiq_internal_service_key_2026'):
            return True
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or missing X-Service-Key header for ForgeIQ AI microservice'
        )
    return True

async def get_tenant_context(
    x_org_id: Optional[str] = Header('org-forge-default', alias='X-Org-ID'),
    x_user_id: Optional[str] = Header('user-default', alias='X-User-ID'),
    x_user_role: Optional[str] = Header('factory_admin', alias='X-User-Role'),
    x_customer_id: Optional[str] = Header(None, alias='X-Customer-ID'),
    _service_verified: bool = Security(verify_service_key)
) -> TenantContext:
    """
    Enforces multi-tenant security context.
    Every query and RAG retrieval MUST be scoped to x_org_id.
    """
    if not x_org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='X-Org-ID header is strictly mandatory for tenant isolation'
        )
        
    is_admin = x_user_role in ['factory_admin', 'owner', 'manager']
    
    return TenantContext(
        org_id=x_org_id,
        user_id=x_user_id,
        user_role=x_user_role,
        customer_id=x_customer_id,
        is_admin=is_admin
    )
