import logging
import sys
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure ai-service root is in sys.path for middleware imports
_SERVICE_ROOT = Path(__file__).resolve().parent.parent
if str(_SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(_SERVICE_ROOT))

from app.config.settings import settings
from middleware.logging_middleware import LoggingMiddleware, setup_structured_logging
from app.security.rate_limit import RateLimitMiddleware
from app.security.auth import router as auth_router
from app.security.audit import router as audit_router
from app.api.chat import router as chat_router
from app.api.rfq import router as rfq_router
from app.api.quotation import router as quotation_router
from app.api.production import router as production_router
from app.api.recommendations import router as recommendations_router
from app.api.documents import router as documents_router
from app.api.rag import router as rag_router
from app.api.telemetry import router as telemetry_router
from app.api.cad import router as cad_router

# Initialize production-grade structured JSON logging
setup_structured_logging(settings.LOG_LEVEL)
logger = logging.getLogger('forgeiq.main')

API_DESCRIPTION = """
# ForgeIQ Industrial AI & Multi-Agent Operations Engine

ForgeIQ is an AI-powered manufacturing intelligence and commerce platform for sheet-metal fabrication, CNC machining, laser cutting, and bending.

---

### Core Architectural Features
- **100% Autonomous Local Intelligence**: Operates fully offline with zero runtime dependency on external LLM providers or OpenAI API keys.
- **Deterministic Manufacturing Calculators**: Exact physics, material weight, laser cutting cycle time, and bending tonnage calculations run in pure deterministic Python algorithms outside the LLM.
- **Tenant Isolation**: Every query and vector retrieval is strictly isolated by `X-Org-ID`.
- **Structured JSON Observability**: Implements 12-factor JSON streaming logs with distributed request correlation (`X-Request-ID`) and performance alerts (>1000ms).

---

### Authentication & Multi-Tenancy Headers
The microservice enforces the following headers for inter-service and client requests:
- **`X-Org-ID`** *(string, required)*: Tenant organization ID (e.g. `org-forge-default`).
- **`X-Service-Key`** *(string, optional in dev)*: Internal microservice authentication key.
- **`X-User-ID`** *(string, optional)*: Authenticated user identifier (e.g. `usr-operator-42`).
- **`Authorization`** *(string, optional)*: Standard `Bearer <JWT>` token. If provided, user identity is automatically extracted.
- **`X-Request-ID`** *(string, optional)*: Client correlation ID. If omitted, the server automatically generates and returns a UUID in response headers.

---

### API Capabilities & Status
| Feature | Implementation Status | Notes |
| :--- | :--- | :--- |
| **API Versioning** | **Implemented** | All business endpoints use the `/api/v1/` prefix. |
| **Pagination** | **Limit-Only** | List endpoints (e.g. `/api/v1/telemetry`) support `?limit=N` (max 200). Cursor-based pagination (`?cursor=...`) is **Not currently supported**. |
| **Filtering** | **Source-Type Only** | RAG search supports `?source_type=...`. Arbitrary field filtering (e.g. `?status=...`) is **Not currently supported**. |
| **Sorting** | **Automatic Ranking** | RAG results are ranked by `relevance_score DESC`; telemetry by `timestamp DESC`. Arbitrary sorting (e.g. `?sort=-created_at`) is **Not currently supported**. |
| **Query Language (DSL)**| **Not Supported** | SQL/DSL expressions such as `price > 50000` or `name LIKE 'sheet'` are **Not currently supported**. |
| **Rate Limiting** | **Unavailable** | Rate limiting headers (`X-RateLimit-*`) are **Not currently implemented**. |
"""

TAGS_METADATA = [
    {
        "name": "Health",
        "description": "System operational readiness, active AI provider mode, and vector backend status."
    },
    {
        "name": "Chat & Copilot",
        "description": "Autonomous multi-agent copilot for factory shop-floor operators and customer portal buyers."
    },
    {
        "name": "RFQ & Order Intake",
        "description": "Unstructured manufacturing RFQ extraction, parameter parsing, and confidence scoring."
    },
    {
        "name": "Quotation Estimation",
        "description": "Technical parameter estimation (laser cut length, cycle time, scrap rate, bending strokes, labor)."
    },
    {
        "name": "Production AI",
        "description": "Shop floor machine workload balancing, routing proposals, and shift schedule optimization."
    },
    {
        "name": "Manufacturer Matching",
        "description": "Factory matchmaking against verified machine specifications, certifications, and delivery windows."
    },
    {
        "name": "Document Ingestion",
        "description": "Tenant-isolated vector indexing of engineering drawings, machine manuals, and material specs."
    },
    {
        "name": "RAG Retrieval",
        "description": "Hybrid semantic and lexical context retrieval scoped strictly to the requesting organization."
    },
    {
        "name": "Observability & Telemetry",
        "description": "Execution audit records, inference latencies, and multi-agent routing telemetry."
    }
]

app = FastAPI(
    title="ForgeIQ AI Engine API",
    description=API_DESCRIPTION,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=TAGS_METADATA,
    contact={
        "name": "ForgeIQ Engineering Team",
        "email": "engineering@forgeiq.com"
    },
    servers=[
        {"url": "http://localhost:8000", "description": "Local Development Server"},
        {"url": "https://ai.forgeiq.internal", "description": "Internal Production AI Gateway"}
    ]
)

# Rate Limiting Middleware (100 req/min user, 1000 req/min API key)
app.add_middleware(RateLimitMiddleware)

# HTTP Request Logging & Tracing Middleware (12-factor JSON logs & >1000ms latency alerts)
app.add_middleware(LoggingMiddleware)

# CORS Middleware to allow Next.js server actions and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.exceptions import HTTPException as StarletteHTTPException

# Standardized Security Exception Handlers (Never expose stack traces to client)
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    req_id = getattr(request.state, "request_id", "req-unknown")
    code = "INVALID_REQUEST"
    if exc.status_code == 401:
        code = "UNAUTHORIZED"
    elif exc.status_code == 403:
        code = "FORBIDDEN"
    elif exc.status_code == 404:
        code = "NOT_FOUND"
    elif exc.status_code == 429:
        code = "RATE_LIMIT_EXCEEDED"

    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
                "request_id": req_id
            },
            "detail": exc.detail
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", "req-unknown")
    errors = exc.errors()
    first_msg = errors[0].get("msg", "Validation error") if errors else "Invalid request body"
    loc = " -> ".join([str(l) for l in errors[0].get("loc", [])]) if errors else ""
    msg = f"{loc}: {first_msg}" if loc else first_msg

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": msg,
                "request_id": req_id
            },
            "detail": exc.errors()
        }
    )

# Global Unhandled Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", "req-unknown")
    logger.error(
        f"Unhandled AI exception on {request.url.path}: {str(exc)}",
        exc_info=True,
        extra={"path": request.url.path, "error_type": type(exc).__name__, "request_id": req_id}
    )
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "AI service temporarily unavailable. Please fallback to deterministic calculators.",
                "request_id": req_id
            }
        }
    )

# Health & Status Check
@app.get(
    "/health",
    tags=["Health"],
    summary="Microservice Health & Readiness Check",
    description="Returns service availability, active AI provider engine ('local'), environment, and vector storage backend."
)
async def health_check():
    return {
        "status": "healthy",
        "service": "ForgeIQ AI Engine",
        "provider": settings.AI_PROVIDER,
        "environment": settings.ENVIRONMENT,
        "vector_backend": settings.VECTOR_BACKEND
    }

@app.get(
    "/",
    tags=["Health"],
    summary="Root Service Index",
    description="Returns welcome status and links to interactive OpenAPI Swagger (/docs) and ReDoc (/redoc) documentation."
)
async def root():
    return {
        "message": "ForgeIQ Production AI Microservice Active",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }

# Mount API Routers
app.include_router(auth_router)
app.include_router(audit_router)
app.include_router(chat_router)
app.include_router(rfq_router)
app.include_router(quotation_router)
app.include_router(production_router)
app.include_router(recommendations_router)
app.include_router(documents_router)
app.include_router(rag_router)
app.include_router(telemetry_router)
app.include_router(cad_router)
