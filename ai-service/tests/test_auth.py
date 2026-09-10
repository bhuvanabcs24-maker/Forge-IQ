import time
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.audit_log import AuditAction, AuditStatus
from app.security.audit import audit_service
from app.security.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    user_repository
)
from app.security.cad_sanitizer import validate_cad_content
from app.security.rate_limit import rate_limiter
from app.security.rbac import (
    RoleChecker,
    UserRole,
    verify_customer_order_ownership,
    verify_operator_machine_assignment,
    verify_tenant_access
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. JWT AUTHENTICATION TESTS
# ---------------------------------------------------------------------------

def test_login_success():
    """Verify that valid credentials return access token (1h) and refresh token (7d)."""
    payload = {
        "email": "manager@forgeiq.com",
        "password": "Password123!"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "Manager"
    assert data["tenant_id"] == "factory_acme_01"
    assert data["expires_in"] == 3600

    # Verify decoded token claims
    claims = decode_token(data["access_token"])
    assert claims["user_id"] == "usr_manager_01"
    assert claims["role"] == "Manager"
    assert claims["tenant_id"] == "factory_acme_01"
    assert "exp" in claims
    assert claims["exp"] > time.time()


def test_login_invalid_password():
    """Verify 401 when password does not match."""
    payload = {
        "email": "manager@forgeiq.com",
        "password": "WrongPassword999!"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401
    err = response.json()["error"]
    assert err["code"] == "UNAUTHORIZED"
    assert "Incorrect email or password" in err["message"]


def test_login_nonexistent_user():
    """Verify 401 when user email is not found."""
    payload = {
        "email": "ghost@forgeiq.com",
        "password": "Password123!"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401


def test_token_refresh_flow():
    """Verify token refresh using 7-day refresh token."""
    # 1. Login
    login_resp = client.post("/auth/login", json={"email": "operator@forgeiq.com", "password": "Password123!"})
    tokens = login_resp.json()
    refresh_token = tokens["refresh_token"]

    # 2. Refresh
    refresh_resp = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()
    assert "access_token" in new_tokens
    assert new_tokens["role"] == "Operator"


def test_user_profile_me():
    """Verify /auth/me returns current user identity from Bearer token."""
    login_resp = client.post("/auth/login", json={"email": "operator@forgeiq.com", "password": "Password123!"})
    token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/auth/me", headers=headers)
    assert resp.status_code == 200
    profile = resp.json()
    assert profile["user_id"] == "usr_operator_01"
    assert profile["role"] == "Operator"
    assert "PRESS-001" in profile["assigned_machines"]


# ---------------------------------------------------------------------------
# 2. ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION MATRIX
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_rbac_role_checker_dependency():
    """Verify RoleChecker allows permitted roles and denies insufficient roles."""
    manager_user = user_repository.get_by_email("manager@forgeiq.com")
    operator_user = user_repository.get_by_email("operator@forgeiq.com")

    # Manager allowed on Manager/Owner routes
    manager_checker = RoleChecker(["Manager", "Owner"])
    result = await manager_checker(current_user=manager_user)
    assert result.user_id == manager_user.user_id

    # Operator rejected on Manager routes
    with pytest.raises(Exception) as exc_info:
        await manager_checker(current_user=operator_user)
    assert "403" in str(exc_info.value) or "Forbidden" in str(exc_info.value)


def test_cross_factory_multi_tenant_isolation():
    """Verify Factory A Manager CANNOT access Factory B data."""
    manager_a = user_repository.get_by_email("manager@forgeiq.com")       # factory_acme_01
    manager_b = user_repository.get_by_email("manager_b@rivalmfg.com")     # factory_rival_02

    # Attempt cross-tenant access
    with pytest.raises(Exception) as exc_info:
        verify_tenant_access(manager_a, target_tenant_id=manager_b.tenant_id)
    assert "Multi-tenant boundary violation" in str(exc_info.value)


def test_operator_machine_assignment_enforcement():
    """Verify Operators can only manage assigned machines."""
    operator = user_repository.get_by_email("operator@forgeiq.com")
    # Operator is assigned PRESS-001 and LASER-001
    # 1. Allowed machine
    verify_operator_machine_assignment(operator, machine_id="PRESS-001")

    # 2. Forbidden unassigned machine (VMC-001)
    with pytest.raises(Exception) as exc_info:
        verify_operator_machine_assignment(operator, machine_id="VMC-001")
    assert "not assigned to machine 'VMC-001'" in str(exc_info.value)


def test_customer_order_isolation():
    """Verify Customers can only view their own customer orders."""
    customer = user_repository.get_by_email("customer@forgeiq.com")  # cust_100

    # 1. Own order
    verify_customer_order_ownership(customer, order_customer_id="cust_100")

    # 2. Rival customer order (cust_200)
    with pytest.raises(Exception) as exc_info:
        verify_customer_order_ownership(customer, order_customer_id="cust_200")
    assert "Customers may only view their own orders" in str(exc_info.value)


# ---------------------------------------------------------------------------
# 3. RATE LIMITING TESTS (100 req/min User, 1000 req/min API Key)
# ---------------------------------------------------------------------------

def test_rate_limiting_headers_present():
    """Verify X-RateLimit-* headers are present on API responses."""
    rate_limiter.reset()
    headers = {
        "X-Org-ID": "org-forge-default",
        "X-Service-Key": "forgeiq_internal_service_key_2026"
    }
    resp = client.get("/api/v1/telemetry", headers=headers)
    assert resp.status_code == 200
    assert "X-RateLimit-Limit" in resp.headers
    assert "X-RateLimit-Remaining" in resp.headers
    assert "X-RateLimit-Reset" in resp.headers


def test_rate_limiting_429_exhaustion():
    """Verify that exhausting 100 requests triggers HTTP 429 Too Many Requests."""
    rate_limiter.reset()
    test_client_key = "ip:192.168.1.50"

    # Simulate 100 requests
    for _ in range(100):
        allowed, limit, remaining, reset = rate_limiter.is_allowed(test_client_key, is_api_key=False)
        assert allowed is True

    # 101st request must be denied
    allowed, limit, remaining, reset = rate_limiter.is_allowed(test_client_key, is_api_key=False)
    assert allowed is False
    assert remaining == 0


def test_rate_limiting_api_key_higher_tier():
    """Verify API keys allow up to 1000 requests/minute."""
    rate_limiter.reset()
    api_key_client = "api_key:forgeiq_internal_service_key_2026"

    # Verify limit is 1000
    allowed, limit, remaining, reset = rate_limiter.is_allowed(api_key_client, is_api_key=True)
    assert allowed is True
    assert limit == 1000
    assert remaining == 999


# ---------------------------------------------------------------------------
# 4. CAD INPUT VALIDATION & SCRIPT SANITIZATION
# ---------------------------------------------------------------------------

def test_cad_sanitizer_valid_dxf():
    """Verify valid clean DXF file is accepted."""
    clean_dxf = b"0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nEOF\n"
    result = validate_cad_content("bracket_drawing.dxf", clean_dxf)
    assert result["valid"] is True
    assert result["clean_filename"] == "bracket_drawing.dxf"
    assert result["extension"] == ".dxf"


def test_cad_sanitizer_rejects_oversized_file():
    """Verify files > 10MB are rejected with 413."""
    oversized = b"0" * (11 * 1024 * 1024)  # 11 MB
    with pytest.raises(Exception) as exc_info:
        validate_cad_content("huge_file.dxf", oversized)
    assert "10MB" in str(exc_info.value) or "413" in str(exc_info.value)


def test_cad_sanitizer_rejects_malicious_autolisp_script():
    """Verify embedded AutoLISP executable command in CAD file is rejected."""
    malicious_dxf = b"0\nSECTION\n(command \"SHELL\" \"rm -rf /\")\n0\nEOF\n"
    with pytest.raises(Exception) as exc_info:
        validate_cad_content("infected_drawing.dxf", malicious_dxf)
    assert "Malicious script" in str(exc_info.value)


def test_cad_sanitizer_directory_traversal_sanitization():
    """Verify path traversal sequences in filenames are stripped."""
    clean_dxf = b"0\nSECTION\n0\nEOF\n"
    result = validate_cad_content("../../../etc/shadow.dxf", clean_dxf)
    assert ".." not in result["clean_filename"]
    assert "/" not in result["clean_filename"]
    assert result["clean_filename"] == "shadow.dxf"


# ---------------------------------------------------------------------------
# 5. IMMUTABLE AUDIT LOGGING TESTS
# ---------------------------------------------------------------------------

def test_audit_log_entry_format():
    """
    Verify exact required format:
    'Order #FG-2042 approved by manager_xyz at timestamp'
    """
    audit_service.clear()
    entry = audit_service.record_event(
        user_id="manager_xyz",
        user_role="Manager",
        tenant_id="factory_acme_01",
        action=AuditAction.APPROVE,
        resource="Order #FG-2042",
        details="Approved after verifying laser cutting cycle time and material availability",
        status=AuditStatus.SUCCESS
    )

    summary = entry.format_summary()
    assert summary.startswith("Order #FG-2042 approved by manager_xyz at")
    assert "2026" in summary


def test_audit_log_api_query():
    """Verify querying /api/v1/audit/logs returns logged actions."""
    audit_service.clear()
    audit_service.record_event(
        user_id="usr_manager_01",
        user_role="Manager",
        tenant_id="factory_acme_01",
        action=AuditAction.UPDATE,
        resource="Order #FG-2042",
        details="Updated status from Quote to Approved",
        status=AuditStatus.SUCCESS
    )

    resp = client.get("/api/v1/audit/logs")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] >= 1
    assert any("Order #FG-2042 updated by usr_manager_01 at" in s for s in data["formatted_summaries"])


# ---------------------------------------------------------------------------
# 6. SANITIZED ERROR HANDLING TESTS
# ---------------------------------------------------------------------------

def test_sanitized_error_handling_format():
    """
    Verify that errors return:
    {"error": {"code": "...", "message": "...", "request_id": "..."}}
    and never leak Python stack traces.
    """
    # Trigger 404
    resp = client.get("/nonexistent_endpoint_for_test")
    assert resp.status_code == 404
    body = resp.json()
    assert "error" in body
    assert body["error"]["code"] == "NOT_FOUND"
    assert "request_id" in body["error"]
    assert "Traceback" not in resp.text
