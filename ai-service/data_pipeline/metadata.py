"""
ForgeIQ Data Pipeline - Metadata & Provenance Models
Defines schema for dataset ingestion records, licensing verification, and provenance.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class SourceRecord(BaseModel):
    id: str
    name: str
    url: str
    organization: str
    source_type: str  # dataset | repository | paper | pdf | documentation | standard
    domain: List[str]
    license: str
    license_verified: bool = False
    training_allowed: bool = False
    rag_allowed: bool = False
    evaluation_allowed: bool = False
    downloaded: bool = False
    quality_score: float = Field(default=0.0, ge=0.0, le=10.0)
    relevance_score: float = Field(default=0.0, ge=0.0, le=10.0)
    authority_score: float = Field(default=0.0, ge=0.0, le=10.0)
    intended_use: str  # TRAINING | RAG | EVALUATION | TOOL_DATA | ACCESS_REQUIRED | REJECTED
    notes: Optional[str] = None

class IngestionItem(BaseModel):
    item_id: str
    source_id: str
    category: str
    title: str
    raw_payload: Dict[str, Any]
    normalized_payload: Optional[Dict[str, Any]] = None
    intended_destination: str  # TRAINING | RAG | EVALUATION | TOOL_DATA
    checksum: str
    ingested_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    validation_status: str = "PENDING"  # PENDING | VALIDATED | REJECTED
    validation_errors: List[str] = Field(default_factory=list)
