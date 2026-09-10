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
    field_confidences: Dict[str, float] = Field(default_factory=dict)
    clarification_questions: List[str] = Field(default_factory=list)
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

# ==========================================================
# PHASE 2: MANUFACTURING KNOWLEDGE, RAG & METADATA SCHEMAS
# ==========================================================

class KnowledgeSourceType(str):
    FACTORY_DATABASE = "factory_database"
    FACTORY_SOP = "factory_sop"
    SUPPLIER_DATA = "supplier_data"
    MANUFACTURER = "manufacturer"
    ENGINEERING_STANDARD = "engineering_standard"
    REFERENCE = "reference"
    GENERAL_WEB = "general_web"
    LLM_MEMORY = "llm_memory"

SOURCE_PRIORITY_ORDER = [
    "factory_database",
    "factory_sop",
    "supplier_data",
    "manufacturer",
    "engineering_standard",
    "reference",
    "general_web",
    "llm_memory",
]

class ManufacturingKnowledgeRecord(BaseModel):
    id: str
    category: str = Field(..., description="MACHINE|MATERIAL|DFM|QUALITY|PRICING|SOP|INVENTORY|SAFETY|SCHEDULING")
    title: str
    content: str
    source: str
    source_url: str = ""
    source_type: str = "factory_database"
    verification_status: str = "verified"  # verified | unverified | reference
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    effective_date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    expiry_date: Optional[str] = None
    last_updated: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    is_stale: bool = False

class MachineRecord(BaseModel):
    machine_id: str
    manufacturer: str = "TO_BE_PROVIDED"
    model: str = "TO_BE_PROVIDED"
    process: str  # LASER_CUTTING | PRESS_BRAKE | CNC_MILLING | MIG_WELDING | TIG_WELDING
    laser_power_kw: Optional[float] = None
    bed_length_mm: Optional[float] = None
    bed_width_mm: Optional[float] = None
    max_workpiece_weight_kg: Optional[float] = None
    tonnage: Optional[float] = None
    bending_length_mm: Optional[float] = None
    x_travel_mm: Optional[float] = None
    y_travel_mm: Optional[float] = None
    z_travel_mm: Optional[float] = None
    max_rpm: Optional[int] = None
    cutting_speed_mm_min: Optional[float] = None
    assist_gases: List[str] = Field(default_factory=list)
    gas_pressure_bar: Optional[float] = None
    hourly_rate_inr: Optional[float] = None
    setup_cost_inr: Optional[float] = None
    status: str = "AVAILABLE"  # AVAILABLE | IN_USE | MAINTENANCE | OFFLINE
    source: str = "FACTORY_DATABASE"
    verification_status: str = "verified"
    confidence: float = 1.0
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class MaterialRecord(BaseModel):
    material_code: str
    family: str  # STAINLESS_STEEL | ALUMINUM | MILD_STEEL | COPPER | ALLOY_STEEL
    grade: str  # 304 | 316L | 6061-T6 | IS2062 | CRCA | HARDOX
    density_kg_m3: float
    thickness_mm: Optional[float] = None
    dimensions_mm: Optional[str] = None
    supplier: str = "TO_BE_PROVIDED"
    current_price_inr_kg: Optional[float] = None
    price_unit: str = "INR/kg"
    minimum_order_quantity: int = 1
    stock_quantity: int = 0
    reserved_quantity: int = 0
    available_quantity: int = 0
    remnant_quantity: int = 0
    supplier_lead_time_days: int = 3
    effective_from: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    valid_until: Optional[str] = None
    is_stale: bool = False
    source: str = "FACTORY_DATABASE"
    confidence: float = 1.0
    verification_status: str = "verified"
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class DFMIssue(BaseModel):
    feature: str
    risk: str
    severity: str = "MEDIUM"  # INFO | LOW | MEDIUM | HIGH | CRITICAL
    current_design: str
    manufacturing_constraint: str
    recommendation: str
    confidence: float = 0.95
    engineering_review_required: bool = False

class DFMAnalysisResult(BaseModel):
    status: str = "PASS"  # PASS | REVIEW | FAIL
    issues: List[DFMIssue] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    confidence: float = 0.95
    engineering_review_required: bool = False

class ConflictResolutionResult(BaseModel):
    resolved_value: Any
    unit: Optional[str] = None
    chosen_source: str
    source_priority_rank: int
    confidence: float
    status: str  # verified | stale | conflicting | unknown
    competing_sources: List[Dict[str, Any]] = Field(default_factory=list)

# ==========================================================
# PHASE 5 & 8: FORGEIQ AI CONTRACT & TOOL CALLING SCHEMAS
# ==========================================================

class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)

class ToolCallResult(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    output: Any
    success: bool = True
    error_message: Optional[str] = None
    execution_time_ms: float = 0.0

class ForgeIQContractResponse(BaseModel):
    """
    Strict internal response schema for ForgeIQ AI decisions.
    Machine-critical operations require this contract.
    """
    answer: str
    intent: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    tools_used: List[str] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    data_freshness: str = "LIVE"  # LIVE | STALE | UNKNOWN
    requires_human_review: bool = False
    structured_payload: Optional[Dict[str, Any]] = None

class ShadowComparisonRecord(BaseModel):
    request_id: str
    query: str
    tenant_org: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    model_a_name: str
    model_a_answer: str
    model_a_tools: List[str]
    model_a_latency_ms: float
    model_b_name: str
    model_b_answer: str
    model_b_tools: List[str]
    model_b_latency_ms: float
    tools_matched: bool
    intent_matched: bool
    hallucination_detected_in_b: bool
    latency_delta_ms: float


