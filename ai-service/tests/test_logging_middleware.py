import json
import logging
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from jose import jwt

from middleware.logging_middleware import (
    LoggingMiddleware,
    StructuredJsonFormatter,
    setup_structured_logging,
    request_id_ctx,
    user_id_ctx,
)


def test_structured_json_formatter():
    formatter = StructuredJsonFormatter()
    logger = logging.getLogger("test.formatter")

    # 1. Standard Info Record
    request_id_ctx.set("req-test-abc")
    user_id_ctx.set("user-test-123")
    record = logger.makeRecord(
        name="test.formatter",
        level=logging.INFO,
        fn="test.py",
        lno=10,
        msg="Operations running smoothly",
        args=(),
        exc_info=None,
        extra={"duration_ms": 42.5, "operation": "calculate_weight"}
    )
    formatted = formatter.format(record)
    data = json.loads(formatted)

    assert data["level"] == "INFO"
    assert data["message"] == "Operations running smoothly"
    assert data["request_id"] == "req-test-abc"
    assert data["user_id"] == "user-test-123"
    assert data["duration_ms"] == 42.5
    assert data["operation"] == "calculate_weight"
    assert "timestamp" in data


def test_structured_json_formatter_error_stack_trace():
    formatter = StructuredJsonFormatter()
    logger = logging.getLogger("test.error")

    try:
        raise ValueError("Invalid dimension parameter")
    except Exception:
        import sys
        exc_info = sys.exc_info()

    record = logger.makeRecord(
        name="test.error",
        level=logging.ERROR,
        fn="test.py",
        lno=30,
        msg="Calculation crashed",
        args=(),
        exc_info=exc_info,
        extra={"duration_ms": 1.2}
    )
    formatted = formatter.format(record)
    data = json.loads(formatted)

    assert data["level"] == "ERROR"
    assert data["error_type"] == "ValueError"
    assert "stack_trace" in data
    assert "ValueError: Invalid dimension parameter" in data["stack_trace"]


def test_logging_middleware_request_id_and_jwt():
    test_app = FastAPI()
    test_app.add_middleware(LoggingMiddleware)

    @test_app.get("/ping")
    def ping():
        return {"status": "pong", "active_req": request_id_ctx.get(), "active_user": user_id_ctx.get()}

    client = TestClient(test_app)

    # 1. Auto-generated request ID
    res = client.get("/ping")
    assert res.status_code == 200
    assert "X-Request-ID" in res.headers
    generated_id = res.headers["X-Request-ID"]
    assert len(generated_id) > 10

    # 2. Client-provided request ID preserved
    custom_req_id = "client-trace-777"
    res2 = client.get("/ping", headers={"X-Request-ID": custom_req_id})
    assert res2.headers["X-Request-ID"] == custom_req_id

    # 3. JWT user extraction
    token = jwt.encode({"sub": "operator-456", "role": "engineer"}, "dummy_secret", algorithm="HS256")
    res3 = client.get("/ping", headers={"Authorization": f"Bearer {token}"})
    assert res3.status_code == 200
    body = res3.json()
    assert body["active_user"] == "operator-456"
