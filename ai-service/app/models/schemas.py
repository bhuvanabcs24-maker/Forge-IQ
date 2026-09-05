from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class RAGCitation(BaseModel):
    source_id: str
    source_title: str
    source_type: str  # document, quotation, machine, order, inventory, knowledge_base
    relevance_score: float
    snippet: str
    org_id: str

class AgentEvidence(BaseModel):
    metric_name: str
    value: Any
    confidence: float = 1.0
    source: str

class StructuredRFQ(BaseModel):
    customer_name: Optional[str] = None
    company_name: Optional[str] = None
    part_title: str = Field(..., description='Identified manufacturing part name')
    material: str = Field(..., description='Base material type (e.g. Stainless Steel, Aluminum)')
    material_grade: Optional[str] = '304'
    thickness: Optional[str] = '3 mm'
    dimensions: Optional[str] = None
    quantity: int = Field(default=1, ge=1)
    delivery_date: Optional[str] = None
    priority: str = Field(default='standard', description='urgent | standard | low')
    special_instructions: Optional[str] = None
    drawing_reference: Optional[str] = None
    required_processes: List[str] = Field(default_factory=list)
    confidence_score: float = Field(default=0.95, ge=0.0, le=1.0)
    requires_human_verification: bool = False

class QuotationEstimate(BaseModel):
    """
    Technical estimation ONLY. Final pricing is computed by ForgeIQ Pricing Engine.
    """
    material_type: str
    material_grade: str
    raw_material_weight_kg: float = Field(..., ge=0.0)
    scrap_rate_percentage: float = Field(default=12.5, ge=0.0, le=100.0)
    cut_length_meters: float = Field(default=0.0, ge=0.0)
    machine_cycle_time_minutes: float = Field(..., ge=0.0)
    bending_strokes_count: int = Field(default=0, ge=0)
    finishing_requirements: List[str] = Field(default_factory=list)
    labor_time_minutes: float = Field(..., ge=0.0)
    estimated_lead_time_days: int = Field(default=7, ge=1)
    confidence_score: float = Field(default=0.92, ge=0.0, le=1.0)
    technical_assumptions: List[str] = Field(default_factory=list)

class FactoryMatchRecommendation(BaseModel):
    factory_id: str
    factory_name: str
    match_score: float = Field(..., ge=0.0, le=100.0)
    reasons: List[str] = Field(default_factory=list)
    capability_matches: List[str] = Field(default_factory=list)
    estimated_price: float = Field(..., ge=0.0)
    estimated_delivery_days: int = Field(..., ge=1)
    quality_score: float = Field(default=4.8, ge=0.0, le=5.0)
    confidence: float = Field(default=0.90, ge=0.0, le=1.0)

class ProductionSchedulingProposal(BaseModel):
    job_id: str
    job_title: str
    recommended_machine_id: str
    recommended_machine_name: str
    recommended_shift: str
    scheduled_start: str
    estimated_duration_hours: float
    delay_risk_score: float = Field(default=0.15, description='0.0 to 1.0 risk index')
    delay_reasons: List[str] = Field(default_factory=list)
    manager_approval_required: bool = True
    confidence: float = Field(default=0.88, ge=0.0, le=1.0)

class CopilotResponse(BaseModel):
    answer: str
    agent_routed: str
    supporting_evidence: List[AgentEvidence] = Field(default_factory=list)
    citations: List[RAGCitation] = Field(default_factory=list)
    confidence: float = 0.95
    recommendation: Optional[str] = None
    suggested_action: Optional[str] = None
    requires_approval: bool = False
    provider_used: str = 'mock'
    is_mock: bool = False
    latency_ms: float = 0.0

class TelemetryRecord(BaseModel):
    request_id: str
    org_id: str
    user_id: Optional[str] = None
    endpoint: str
    agent_used: Optional[str] = None
    provider: str
    model: str
    latency_ms: float
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    confidence: float = 1.0
    success: bool = True
    error_message: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
