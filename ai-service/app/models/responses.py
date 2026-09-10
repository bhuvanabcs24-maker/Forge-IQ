from typing import Generic, TypeVar, Optional, List, Any, Dict
from pydantic import BaseModel, Field
from app.models.schemas import (
    StructuredRFQ,
    QuotationEstimate,
    FactoryMatchRecommendation,
    ProductionSchedulingProposal,
    CopilotResponse,
    RAGCitation,
    TelemetryRecord
)

T = TypeVar('T')

class APIEnvelope(BaseModel, Generic[T]):
    success: bool = Field(default=True, description="Indicates whether the request completed successfully", examples=[True])
    data: Optional[T] = Field(default=None, description="Typed payload data returned by the endpoint")
    error: Optional[str] = Field(default=None, description="Error message if success is false", examples=[None])
    warning: Optional[str] = Field(default=None, description="Optional system warnings or human-verification notices", examples=[None])
    is_mock: bool = Field(default=False, description="Flag indicating if the response was served from a mock fallback", examples=[False])
    provider_used: str = Field(default='local', description="Name of the manufacturing AI or tool provider", examples=['local', 'quotation_agent'])
    latency_ms: float = Field(default=0.0, description="Server-side execution latency in milliseconds", examples=[3.6])

class IngestionResponse(BaseModel):
    document_id: str = Field(..., description="Unique generated ID for the indexed document", examples=["doc_spec_amada_hfe_01"])
    chunks_created: int = Field(..., description="Number of text chunks generated during chunking", examples=[12])
    embeddings_generated: int = Field(..., description="Number of vector embeddings created and indexed", examples=[12])
    org_id: str = Field(..., description="Tenant organization ID the document is isolated to", examples=["org-forge-default"])
    status: str = Field(default='indexed', description="Ingestion status", examples=["indexed"])

class ErrorDetail(BaseModel):
    code: str = Field(..., description="Machine-readable error classification code", examples=["INVALID_REQUEST", "UNAUTHORIZED", "NOT_FOUND", "INTERNAL_SERVER_ERROR"])
    message: str = Field(..., description="Human-readable description of the error", examples=["X-Org-ID header is strictly mandatory for tenant isolation"])
    request_id: Optional[str] = Field(None, description="Unique correlation ID for tracing the failed request in logs", examples=["f07e6d61-970d-4733-8b98-cb20f67bab07"])

class ErrorResponse(BaseModel):
    success: bool = Field(default=False, description="Always false for error responses", examples=[False])
    error: ErrorDetail = Field(..., description="Structured error payload")
    detail: Optional[str] = Field(None, description="Additional debugging context available in development environment", examples=[None])

COMMON_ERROR_RESPONSES: Dict[int, Dict[str, Any]] = {
    400: {
        "model": ErrorResponse,
        "description": "Bad Request — Missing required tenant headers (e.g. X-Org-ID) or malformed request payload."
    },
    401: {
        "model": ErrorResponse,
        "description": "Unauthorized — Missing or invalid X-Service-Key or invalid Authorization Bearer token."
    },
    404: {
        "model": ErrorResponse,
        "description": "Not Found — Requested resource or entity does not exist."
    },
    500: {
        "model": ErrorResponse,
        "description": "Internal Server Error — Unhandled exception; client should fallback to rule-based operations."
    }
}
