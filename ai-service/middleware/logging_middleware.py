"""
Production-grade structured JSON logging and request tracing middleware for ForgeIQ.

Implements 12-factor application observability best practices:
- Asynchronous context variable correlation (request_id, user_id, org_id)
- ISO 8601 UTC timestamps
- Strict JSON streaming to stdout
- Automated JWT user extraction (without signature verification dependency)
- Performance monitoring with warning threshold for latency > 1000ms
- Comprehensive stack trace capturing in JSON payload
"""

import json
import logging
import sys
import time
import traceback
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

try:
    from jose import jwt
except ImportError:
    jwt = None

# Context variables for distributed request tracing
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")
user_id_ctx: ContextVar[str] = ContextVar("user_id", default="anonymous")
org_id_ctx: ContextVar[str] = ContextVar("org_id", default="default")

# Standard LogRecord attributes to omit from the custom extra JSON dictionary
_RESERVED_RECORD_ATTRS = {
    "args", "asctime", "created", "exc_info", "exc_text", "filename",
    "funcName", "levelname", "levelno", "lineno", "module", "msecs",
    "message", "msg", "name", "pathname", "process", "processName",
    "relativeCreated", "stack_info", "thread", "threadName"
}

# Sensitive key names to automatically mask
_SENSITIVE_KEYS = {
    "authorization", "token", "jwt", "api_key", "secret", "password",
    "x-service-key", "x_service_key"
}


def get_current_request_id() -> str:
    """Returns the active request ID from context or empty string."""
    return request_id_ctx.get()


def get_current_user_id() -> str:
    """Returns the active user ID from context or 'anonymous'."""
    return user_id_ctx.get()


def _mask_sensitive_data(obj: Any) -> Any:
    """Recursively masks sensitive tokens and keys in logging metadata."""
    if isinstance(obj, dict):
        masked = {}
        for k, v in obj.items():
            if str(k).lower() in _SENSITIVE_KEYS:
                masked[k] = "[MASKED]"
            else:
                masked[k] = _mask_sensitive_data(v)
        return masked
    elif isinstance(obj, (list, tuple)):
        return [_mask_sensitive_data(item) for item in obj]
    return obj


class StructuredJsonFormatter(logging.Formatter):
    """
    Formats standard Python LogRecord instances into structured single-line JSON.
    
    Guarantees consistent schema:
    {
      "timestamp": "2026-09-10T03:45:00.123Z",
      "level": "INFO",
      "logger": "forgeiq.api",
      "message": "...",
      "request_id": "...",
      "user_id": "...",
      "duration_ms": 12.34,
      "error_type": null,
      ... extras
    }
    """

    def format(self, record: logging.LogRecord) -> str:
        """Serializes the log record to a JSON string."""
        now = datetime.now(timezone.utc)
        iso_timestamp = now.strftime("%Y-%m-%dT%H:%M:%S.") + f"{int(now.microsecond / 1000):03d}Z"

        # Resolve request_id and user_id from record extras or contextvars
        req_id = getattr(record, "request_id", None) or request_id_ctx.get() or None
        u_id = getattr(record, "user_id", None) or user_id_ctx.get() or "anonymous"
        duration_ms = getattr(record, "duration_ms", None)
        error_type = getattr(record, "error_type", None)

        # Handle exception stack traces
        stack_trace = None
        if record.exc_info:
            stack_trace = "".join(traceback.format_exception(*record.exc_info)).strip()
            if not error_type and record.exc_info[0]:
                error_type = record.exc_info[0].__name__

        payload: Dict[str, Any] = {
            "timestamp": iso_timestamp,
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": req_id,
            "user_id": u_id,
            "duration_ms": duration_ms,
            "error_type": error_type,
        }

        if stack_trace:
            payload["stack_trace"] = stack_trace

        # Extract non-reserved extras attached to the log call
        extras: Dict[str, Any] = {}
        for key, value in record.__dict__.items():
            if key not in _RESERVED_RECORD_ATTRS and key not in payload:
                extras[key] = value

        if extras:
            payload.update(_mask_sensitive_data(extras))

        # Drop None keys for cleaner JSON output where appropriate,
        # but always keep required core keys
        core_keys = {"timestamp", "level", "request_id", "user_id", "duration_ms", "error_type", "message"}
        for k in list(payload.keys()):
            if k not in core_keys and payload[k] is None:
                payload.pop(k)

        try:
            return json.dumps(payload, ensure_ascii=False, default=str)
        except Exception as err:
            return json.dumps({
                "timestamp": iso_timestamp,
                "level": "ERROR",
                "logger": "forgeiq.logging",
                "message": f"Log serialization failure: {str(err)}",
                "request_id": req_id,
                "user_id": u_id,
                "duration_ms": None,
                "error_type": "SerializationError"
            })


def setup_structured_logging(log_level: str = "INFO") -> None:
    """
    Configures Python standard logging to stream structured JSON to stdout.
    Reconfigures root and framework loggers (uvicorn, fastapi, forgeiq).
    """
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Clear existing handlers to prevent duplicate lines
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    # Attach JSON stream handler targeting standard output
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(numeric_level)
    stream_handler.setFormatter(StructuredJsonFormatter())
    root_logger.addHandler(stream_handler)

    # Propagate formatted JSON across third-party framework loggers
    for logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error", "fastapi"):
        l = logging.getLogger(logger_name)
        l.handlers = []
        l.propagate = True

    logging.getLogger("forgeiq").info(
        "Structured JSON logging initialized",
        extra={"configured_level": log_level.upper(), "destination": "stdout"}
    )


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    FastAPI HTTP middleware for structured logging, distributed tracing,
    and performance monitoring (>1000ms latency alerts).
    """

    def _extract_user_id(self, request: Request) -> str:
        """
        Extracts user identity from JWT Authorization header or X-User-ID.
        Falls back to 'anonymous' safely without failing on invalid tokens.
        """
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
            if jwt and token:
                try:
                    claims = jwt.get_unverified_claims(token)
                    user_id = claims.get("sub") or claims.get("user_id") or claims.get("id") or claims.get("email")
                    if user_id:
                        return str(user_id)
                except Exception:
                    pass

        # Fallback to explicit header
        header_user = request.headers.get("X-User-ID")
        if header_user:
            return header_user

        return "anonymous"

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """
        Processes every incoming HTTP request:
        1. Generates / extracts correlation request_id
        2. Binds request_id and user_id to contextvars
        3. Measures latency and logs structured request summary
        4. Issues warning if latency exceeds 1000ms
        5. Injects X-Request-ID into response headers
        """
        start_time = time.perf_counter()
        logger = logging.getLogger("forgeiq.http")

        # 1. Correlation ID management
        request_id = request.headers.get("X-Request-ID") or request.headers.get("X-Correlation-ID")
        if not request_id:
            request_id = str(uuid.uuid4())

        user_id = self._extract_user_id(request)
        org_id = request.headers.get("X-Org-ID", "default")

        # 2. Context binding
        req_token = request_id_ctx.set(request_id)
        user_token = user_id_ctx.set(user_id)
        org_token = org_id_ctx.set(org_id)

        method = request.method
        path = request.url.path
        query_params = dict(request.query_params)

        try:
            # 3. Request execution
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

            # Invalidate/propagate correlation ID
            response.headers["X-Request-ID"] = request_id

            # 4. Performance monitoring (>1000ms warning)
            if duration_ms > 1000.0:
                logger.warning(
                    f"SLOW HTTP REQUEST: {method} {path} took {duration_ms}ms (>1000ms threshold)",
                    extra={
                        "method": method,
                        "path": path,
                        "query_params": query_params,
                        "status_code": response.status_code,
                        "duration_ms": duration_ms,
                        "performance_warning": True,
                        "threshold_ms": 1000.0
                    }
                )

            # 5. Status-based logging
            if response.status_code >= 500:
                logger.error(
                    f"{method} {path} failed with HTTP {response.status_code}",
                    extra={
                        "method": method,
                        "path": path,
                        "query_params": query_params,
                        "status_code": response.status_code,
                        "duration_ms": duration_ms,
                        "error_type": f"HTTP_{response.status_code}"
                    }
                )
            else:
                logger.info(
                    f"{method} {path} completed with HTTP {response.status_code}",
                    extra={
                        "method": method,
                        "path": path,
                        "query_params": query_params,
                        "status_code": response.status_code,
                        "duration_ms": duration_ms
                    }
                )

            return response

        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
            logger.error(
                f"Unhandled exception processing {method} {path}: {str(exc)}",
                exc_info=True,
                extra={
                    "method": method,
                    "path": path,
                    "query_params": query_params,
                    "duration_ms": duration_ms,
                    "error_type": type(exc).__name__
                }
            )
            raise exc

        finally:
            # Reset contextvars
            request_id_ctx.reset(req_token)
            user_id_ctx.reset(user_token)
            org_id_ctx.reset(org_token)
