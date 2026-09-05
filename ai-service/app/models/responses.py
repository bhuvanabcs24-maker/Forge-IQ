from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel
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
    success: bool = True
    data: Optional[T] = None
    error: Optional[str] = None
    warning: Optional[str] = None
    is_mock: bool = False
    provider_used: str = 'mock'
    latency_ms: float = 0.0

class IngestionResponse(BaseModel):
    document_id: str
    chunks_created: int
    embeddings_generated: int
    org_id: str
    status: str = 'indexed'
