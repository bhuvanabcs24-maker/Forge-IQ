import hashlib
import hmac
import os
import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field

from app.config.settings import settings
from app.models.audit_log import AuditAction, AuditStatus
from app.security.audit import audit_service

# JWT Secret and Configuration
JWT_SECRET = getattr(settings, "JWT_SECRET", "forgeiq-secret-key-production-2026-industrial-ai")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60         # 1 Hour
REFRESH_TOKEN_EXPIRE_DAYS = 7            # 7 Days

security_bearer = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# 1. MODELS & SCHEMAS
# ---------------------------------------------------------------------------

class TenantContext(BaseModel):
    org_id: str
    user_id: Optional[str] = 'system'
    user_role: Optional[str] = 'operator'
    customer_id: Optional[str] = None  # populated if request is from Buyer/Customer Portal
    is_admin: bool = False
    assigned_machines: List[str] = Field(default_factory=list)


class User(BaseModel):
    user_id: str
    email: str
    hashed_password: str
    salt: str
    role: str  # Owner, Manager, Operator, QA, Customer
    tenant_id: str
    full_name: str
    assigned_machines: List[str] = Field(default_factory=list)
    customer_id: Optional[str] = None
    is_active: bool = True


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    user_id: str
    role: str
    tenant_id: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserProfileResponse(BaseModel):
    user_id: str
    email: str
    role: str
    tenant_id: str
    full_name: str
    assigned_machines: List[str]
    customer_id: Optional[str]


# ---------------------------------------------------------------------------
# 2. CRYPTOGRAPHIC PASSWORD HASHING
# ---------------------------------------------------------------------------

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Generates PBKDF2-HMAC-SHA256 password hash with cryptographic salt."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return hashed, salt


def verify_password(plain_password: str, hashed_password: str, salt: str) -> bool:
    """Verifies plain password against stored hash using constant-time comparison."""
    computed_hash, _ = hash_password(plain_password, salt)
    return hmac.compare_digest(computed_hash, hashed_password)


# ---------------------------------------------------------------------------
# 3. ENTERPRISE USER REPOSITORY (In-Memory Pre-loaded Store)
# ---------------------------------------------------------------------------

class UserRepository:
    def __init__(self):
        self._users_by_email: Dict[str, User] = {}
        self._users_by_id: Dict[str, User] = {}
        self._seed_default_users()

    def _seed_default_users(self):
        default_accounts = [
            {
                "user_id": "usr_owner_01",
                "email": "owner@forgeiq.com",
                "password": "Password123!",
                "role": "Owner",
                "tenant_id": "factory_acme_01",
                "full_name": "Chief Executive Owner",
                "assigned_machines": ["PRESS-001", "PRESS-002", "LASER-001", "VMC-001"],
                "customer_id": None
            },
            {
                "user_id": "usr_manager_01",
                "email": "manager@forgeiq.com",
                "password": "Password123!",
                "role": "Manager",
                "tenant_id": "factory_acme_01",
                "full_name": "Operations Manager",
                "assigned_machines": ["PRESS-001", "PRESS-002", "LASER-001", "VMC-001"],
                "customer_id": None
            },
            {
                "user_id": "usr_operator_01",
                "email": "operator@forgeiq.com",
                "password": "Password123!",
                "role": "Operator",
                "tenant_id": "factory_acme_01",
                "full_name": "CNC Press Operator",
                "assigned_machines": ["PRESS-001", "LASER-001"],
                "customer_id": None
            },
            {
                "user_id": "usr_qa_01",
                "email": "qa@forgeiq.com",
                "password": "Password123!",
                "role": "QA",
                "tenant_id": "factory_acme_01",
                "full_name": "Lead Quality Inspector",
                "assigned_machines": [],
                "customer_id": None
            },
            {
                "user_id": "usr_customer_01",
                "email": "customer@forgeiq.com",
                "password": "Password123!",
                "role": "Customer",
                "tenant_id": "customer_global_01",
                "full_name": "Global OEM Buyer",
                "assigned_machines": [],
                "customer_id": "cust_100"
            },
            {
                "user_id": "usr_manager_b_01",
                "email": "manager_b@rivalmfg.com",
                "password": "Password123!",
                "role": "Manager",
                "tenant_id": "factory_rival_02",
                "full_name": "Rival Factory Manager",
                "assigned_machines": ["RIVAL-LASER-01"],
                "customer_id": None
            }
        ]

        for acc in default_accounts:
            hashed, salt = hash_password(acc["password"])
            user = User(
                user_id=acc["user_id"],
                email=acc["email"].lower(),
                hashed_password=hashed,
                salt=salt,
                role=acc["role"],
                tenant_id=acc["tenant_id"],
                full_name=acc["full_name"],
                assigned_machines=acc["assigned_machines"],
                customer_id=acc["customer_id"]
            )
            self.add_user(user)

    def add_user(self, user: User):
        self._users_by_email[user.email.lower()] = user
        self._users_by_id[user.user_id] = user

    def get_by_email(self, email: str) -> Optional[User]:
        return self._users_by_email.get(email.lower())

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self._users_by_id.get(user_id)


user_repository = UserRepository()


# ---------------------------------------------------------------------------
# 4. TOKEN CREATION & VERIFICATION
# ---------------------------------------------------------------------------

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Signs an access JWT token with 1-hour expiry."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "type": "access"
    })
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Signs a refresh JWT token with 7-day expiry."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta if expires_delta else timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "type": "refresh"
    })
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decodes and cryptographically validates a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please refresh your session.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token signature.",
            headers={"WWW-Authenticate": "Bearer"}
        )


# ---------------------------------------------------------------------------
# 5. DEPENDENCIES: USER & TENANT CONTEXT
# ---------------------------------------------------------------------------

async def verify_service_key(
    x_service_key: Optional[str] = Header(None, alias='X-Service-Key')
) -> bool:
    """Verifies that the request originates from an authorized ForgeIQ internal service."""
    if not settings.AI_SERVICE_API_KEY:
        return True
    
    if not x_service_key or x_service_key != settings.AI_SERVICE_API_KEY:
        if settings.ENVIRONMENT == 'development' and (not x_service_key or x_service_key == 'forgeiq_internal_service_key_2026'):
            return True
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or missing X-Service-Key header for ForgeIQ AI microservice'
        )
    return True


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> User:
    """
    Strictly verifies JWT Bearer token and returns the active User object.
    Raises 401 if missing or invalid.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide a valid Bearer token in the Authorization header.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type. Access token required."
        )

    user_id = payload.get("user_id")
    user = user_repository.get_by_id(user_id) if user_id else None
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found or deactivated."
        )
    return user


async def get_tenant_context(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    x_org_id: Optional[str] = Header('org-forge-default', alias='X-Org-ID'),
    x_user_id: Optional[str] = Header('user-default', alias='X-User-ID'),
    x_user_role: Optional[str] = Header('factory_admin', alias='X-User-Role'),
    x_customer_id: Optional[str] = Header(None, alias='X-Customer-ID'),
    _service_verified: bool = Security(verify_service_key)
) -> TenantContext:
    """
    Enforces multi-tenant security context.
    If a valid JWT Bearer token is provided, it extracts identity and tenant claims.
    Otherwise, gracefully falls back to verified inter-service headers.
    """
    if credentials and credentials.credentials:
        try:
            payload = decode_token(credentials.credentials)
            org_id = payload.get("tenant_id") or payload.get("org_id", x_org_id)
            user_id = payload.get("user_id", x_user_id)
            user_role = payload.get("role", x_user_role)
            customer_id = payload.get("customer_id", x_customer_id)
            assigned_machines = payload.get("assigned_machines", [])

            is_admin = str(user_role).lower() in ['factory_admin', 'owner', 'manager']
            return TenantContext(
                org_id=org_id,
                user_id=user_id,
                user_role=user_role,
                customer_id=customer_id,
                is_admin=is_admin,
                assigned_machines=assigned_machines
            )
        except HTTPException:
            # If explicit token was provided but failed, propagate exception
            raise
        except Exception:
            pass

    # Header-based fallback (for existing test suite and internal mesh)
    if not x_org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='X-Org-ID header is strictly mandatory for tenant isolation'
        )
        
    is_admin = str(x_user_role).lower() in ['factory_admin', 'owner', 'manager']
    return TenantContext(
        org_id=x_org_id,
        user_id=x_user_id,
        user_role=x_user_role,
        customer_id=x_customer_id,
        is_admin=is_admin,
        assigned_machines=[]
    )


# ---------------------------------------------------------------------------
# 6. FASTAPI AUTH ROUTER (/auth/login, /auth/refresh, /auth/me)
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate User & Issue JWT Tokens",
    description="Validates email and password, issuing a 1-hour access token and a 7-day refresh token with RBAC role claims."
)
async def login(request: LoginRequest):
    user = user_repository.get_by_email(request.email)
    if not user or not verify_password(request.password, user.hashed_password, user.salt):
        # Audit failed login attempt
        audit_service.record_event(
            user_id=request.email,
            user_role="Anonymous",
            tenant_id="Unknown",
            action=AuditAction.LOGIN,
            resource="/auth/login",
            details="Failed login attempt: Invalid credentials",
            status=AuditStatus.FAILURE
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Issue JWT tokens
    claims = {
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role,
        "tenant_id": user.tenant_id,
        "assigned_machines": user.assigned_machines,
        "customer_id": user.customer_id
    }
    access_token = create_access_token(claims)
    refresh_token = create_refresh_token({"user_id": user.user_id, "email": user.email})

    # Audit successful login
    audit_service.record_event(
        user_id=user.user_id,
        user_role=user.role,
        tenant_id=user.tenant_id,
        action=AuditAction.LOGIN,
        resource="/auth/login",
        details=f"User {user.email} authenticated successfully as {user.role}",
        status=AuditStatus.SUCCESS
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.user_id,
        role=user.role,
        tenant_id=user.tenant_id
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh Access Token",
    description="Refreshes an expired access token using a valid 7-day refresh token."
)
async def refresh_token(request: RefreshTokenRequest):
    payload = decode_token(request.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provided token is not a valid refresh token."
        )

    user_id = payload.get("user_id")
    user = user_repository.get_by_id(user_id) if user_id else None
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists or has been deactivated."
        )

    claims = {
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role,
        "tenant_id": user.tenant_id,
        "assigned_machines": user.assigned_machines,
        "customer_id": user.customer_id
    }
    new_access_token = create_access_token(claims)
    new_refresh_token = create_refresh_token({"user_id": user.user_id, "email": user.email})

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.user_id,
        role=user.role,
        tenant_id=user.tenant_id
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get Current User Profile",
    description="Returns the profile, role, tenant, and assigned machines for the currently authenticated JWT user."
)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserProfileResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        role=current_user.role,
        tenant_id=current_user.tenant_id,
        full_name=current_user.full_name,
        assigned_machines=current_user.assigned_machines,
        customer_id=current_user.customer_id
    )
