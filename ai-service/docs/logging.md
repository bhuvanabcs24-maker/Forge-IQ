# ForgeIQ AI Microservice — Structured Logging & Observability

## 1. Overview
The ForgeIQ AI Microservice implements enterprise-grade, 12-factor-compliant structured logging. All events, HTTP requests, business logic executions, model inferences, and errors are serialized as single-line JSON streams to `sys.stdout`.

---

## 2. Core Architecture & Capabilities
- **12-Factor Compliant**: Logs stream directly to standard output as unbuffered newline-delimited JSON.
- **Distributed Request Tracing**: Automatic generation and propagation of `request_id` (`uuid4`) via Python `contextvars.ContextVar`. Correlates all downstream database queries, calculators, and AI calls belonging to the same HTTP request.
- **JWT Identity Extraction**: Extracts `user_id` from JWT Bearer tokens (`Authorization: Bearer <token>`) or `X-User-ID` headers without blocking on token validation errors.
- **Performance Threshold Monitoring**: Automatically logs a `WARNING` with `performance_warning: true` whenever any HTTP request, database lookup, calculator, or model inference exceeds **1000ms**.
- **Stack Trace Encapsulation**: Full Python tracebacks are safely captured inside the JSON payload under `stack_trace` and `error_type` instead of leaking unstructured raw text to stderr.

---

## 3. How to Enable / Disable Debug Logging

### Method A: Via Environment Variable (`.env` or shell)
To enable detailed `DEBUG` logging:
```bash
# In ai-service/.env or shell environment
LOG_LEVEL=DEBUG
```

To disable debug logging and use production `INFO` or `WARNING` level:
```bash
LOG_LEVEL=INFO
# Or in high-throughput production:
LOG_LEVEL=WARNING
```

### Method B: Programmatic Override
```python
from middleware.logging_middleware import setup_structured_logging

# Enable debug logging at runtime
setup_structured_logging(log_level="DEBUG")

# Disable debug logging (return to standard INFO)
setup_structured_logging(log_level="INFO")
```

---

## 4. Log Schema Specification

Every log entry conforms to the following standardized JSON schema:

| Field | Type | Description |
| :--- | :--- | :--- |
| `timestamp` | `string` | ISO 8601 UTC timestamp with millisecond precision (e.g. `2026-09-10T03:48:54.463Z`) |
| `level` | `string` | Log severity level (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`) |
| `logger` | `string` | Python logger namespace (e.g. `forgeiq.http`, `forgeiq.orchestrator`, `forgeiq.tools`) |
| `message` | `string` | Human-readable event description |
| `request_id` | `string \| null` | UUID correlating all logs within an HTTP request lifecycle |
| `user_id` | `string` | Identified caller ID (`sub` from JWT, `X-User-ID`, or `anonymous`) |
| `duration_ms` | `float \| null` | Execution time in milliseconds (for operations with measurable latency) |
| `error_type` | `string \| null` | Exception class name if an error occurred (e.g. `ValueError`, `HTTP_500`) |
| `stack_trace` | `string` *(optional)* | Formatted traceback string present when `exc_info=True` |
| `...extras` | `any` | Contextual business metadata (e.g. `tool_name`, `status_code`, `path`, `provider`) |

---

## 5. Five Example Log Scenarios

### Scenario 1: Standard HTTP Request (INFO)
```json
{
  "timestamp": "2026-09-10T03:48:51.190Z",
  "level": "INFO",
  "logger": "forgeiq.http",
  "message": "GET /health completed with HTTP 200",
  "request_id": "65ef9474-f306-4c4f-9122-4ba84af025b7",
  "user_id": "usr-shop-admin-01",
  "duration_ms": 0.82,
  "error_type": null,
  "method": "GET",
  "path": "/health",
  "query_params": {},
  "status_code": 200
}
```

### Scenario 2: Business Logic & Deterministic Calculator (INFO)
```json
{
  "timestamp": "2026-09-10T03:49:07.276Z",
  "level": "INFO",
  "logger": "forgeiq.tools",
  "message": "Calculator/tool execution finished: calculate_laser_time",
  "request_id": "f07e6d61-970d-4733-8b98-cb20f67bab07",
  "user_id": "usr-operator-42",
  "duration_ms": 0.06,
  "error_type": null,
  "tool_name": "calculate_laser_time",
  "is_calculator": true,
  "cache_hit": false,
  "operation": "tool_execute"
}
```

### Scenario 3: Performance Warning for Slow Operation (>1000ms) (WARNING)
```json
{
  "timestamp": "2026-09-10T03:45:22.778Z",
  "level": "WARNING",
  "logger": "forgeiq.http",
  "message": "SLOW HTTP REQUEST: POST /api/v1/chat/completions took 1250.0ms (>1000ms threshold)",
  "request_id": "req-heavy-analysis-888",
  "user_id": "usr-engineer-99",
  "duration_ms": 1250.0,
  "error_type": null,
  "performance_warning": true,
  "threshold_ms": 1000.0,
  "method": "POST",
  "path": "/api/v1/chat/completions",
  "status_code": 200
}
```

### Scenario 4: Error Logging with Full Stack Trace (ERROR)
```json
{
  "timestamp": "2026-09-10T03:45:22.778Z",
  "level": "ERROR",
  "logger": "forgeiq.tools",
  "message": "Calculator/tool execution failed: calculate_quote: Invalid dimension parameter",
  "request_id": "f07e6d61-970d-4733-8b98-cb20f67bab07",
  "user_id": "usr-operator-42",
  "duration_ms": 1.2,
  "error_type": "ValueError",
  "tool_name": "calculate_quote",
  "stack_trace": "Traceback (most recent call last):\n  File \"/Users/bhuvanab/ForgeIQ/ai-service/app/tools/registry.py\", line 528, in execute_tool\n    output = func(**arguments)\nValueError: Invalid dimension parameter"
}
```

### Scenario 5: Multi-Step AI Orchestrator & RAG Trace (INFO)
```json
{
  "timestamp": "2026-09-10T03:48:54.466Z",
  "level": "INFO",
  "logger": "forgeiq.orchestrator",
  "message": "AI orchestrator query completed",
  "request_id": "f07e6d61-970d-4733-8b98-cb20f67bab07",
  "user_id": "usr-operator-42",
  "duration_ms": 3.6,
  "error_type": null,
  "agent_used": "quotation_agent",
  "confidence": 0.94,
  "provider": "local",
  "operation": "orchestrator_complete"
}
```
