from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ChatQueryRequest(BaseModel):
    query: str = Field(..., description='Natural language question or instruction')
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    conversation_history: Optional[List[Dict[str, str]]] = Field(default_factory=list)

class CustomerChatRequest(BaseModel):
    query: str = Field(..., description='Customer inquiry regarding order status or quotes')
    customer_id: str = Field(..., description='Must match authenticated customer identity')
    order_id: Optional[str] = None

class RFQIntakeRequest(BaseModel):
    raw_text: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_content_base64: Optional[str] = None
    sample_preset_id: Optional[str] = None

class QuotationEstimationRequest(BaseModel):
    part_title: str
    material: str
    material_grade: Optional[str] = '304'
    thickness: Optional[str] = '3 mm'
    dimensions: Optional[str] = '250 x 180 x 3 mm'
    quantity: int = 500
    drawing_reference: Optional[str] = None
    special_processes: Optional[List[str]] = Field(default_factory=list)

class FactoryMatchRequest(BaseModel):
    rfq_title: str
    material_grade: str
    quantity: int
    required_delivery_days: int
    target_budget: Optional[float] = None
    required_processes: Optional[List[str]] = Field(default_factory=list)
    buyer_preference: Optional[str] = 'balanced'

class ProductionRecommendationRequest(BaseModel):
    job_id: str
    part_name: str
    quantity: int
    target_deadline: str
    required_processes: List[str]

class DocumentIngestionRequest(BaseModel):
    document_title: str
    document_type: str  # manual, policy, machine_spec, material_spec, contract
    content_text: str
    source_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
