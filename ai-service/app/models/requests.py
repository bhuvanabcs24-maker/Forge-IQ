from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ChatQueryRequest(BaseModel):
    query: str = Field(
        ...,
        description='Natural language manufacturing inquiry, order query, or technical question',
        examples=['What is the cutting cycle time and scrap rate for 100 units of 3mm SS304 brackets?']
    )
    context: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description='Optional operational context, e.g. current machine_id or active order_id',
        examples=[{"machine_id": "mach-laser-01", "stage": "cutting"}]
    )
    conversation_history: Optional[List[Dict[str, str]]] = Field(
        default_factory=list,
        description='Recent conversation turns for contextual dialog resolution',
        examples=[[{"role": "user", "content": "Can we take on 500 brackets?"}, {"role": "assistant", "content": "Checking laser capacity..."}]]
    )

class CustomerChatRequest(BaseModel):
    query: str = Field(
        ...,
        description='Customer inquiry regarding order status, delivery date, or quotations',
        examples=['What is the current production milestone for our order PO-2026-0492?']
    )
    customer_id: str = Field(
        ...,
        description='Authenticated customer account identifier for tenant data isolation',
        examples=['cust-nexa-442']
    )
    order_id: Optional[str] = Field(
        default=None,
        description='Optional specific purchase order or RFQ reference number',
        examples=['PO-2026-0492']
    )

class RFQIntakeRequest(BaseModel):
    raw_text: Optional[str] = Field(
        default=None,
        description='Raw text content from customer email, WhatsApp message, or RFQ brief',
        examples=['Customer: NexaSolar Industries. Need 500 pcs SS304 brackets, 3mm thickness, outer dimensions 250x180mm with 4 bends. Required within 7 days in Bengaluru.']
    )
    file_name: Optional[str] = Field(
        default=None,
        description='Original filename if document was uploaded',
        examples=['RFQ-Nexa-Solar-Brackets.pdf']
    )
    file_type: Optional[str] = Field(
        default=None,
        description='MIME type of uploaded document',
        examples=['application/pdf']
    )
    file_content_base64: Optional[str] = Field(
        default=None,
        description='Base64-encoded file payload (optional for text-only RFQs)'
    )
    sample_preset_id: Optional[str] = Field(
        default=None,
        description='Preset template identifier for benchmark verification',
        examples=['preset-solar-bracket-500']
    )

class QuotationEstimationRequest(BaseModel):
    part_title: str = Field(
        ...,
        description='Descriptive title of the manufactured component',
        examples=['SS304 Precision Mounting Bracket']
    )
    material: str = Field(
        ...,
        description='Base raw material specification',
        examples=['Stainless Steel']
    )
    material_grade: Optional[str] = Field(
        default='304',
        description='Standard engineering material grade',
        examples=['304', '316L', 'CRCA-IS513']
    )
    thickness: Optional[str] = Field(
        default='3 mm',
        description='Raw sheet stock thickness with units',
        examples=['3 mm', '2 mm', '1.5 mm']
    )
    dimensions: Optional[str] = Field(
        default='250 x 180 x 45 mm',
        description='Outer bounding dimensions (Length x Width x Height in mm)',
        examples=['250 x 180 x 45 mm']
    )
    quantity: int = Field(
        default=500,
        ge=1,
        description='Batch production volume',
        examples=[500]
    )
    drawing_reference: Optional[str] = Field(
        default=None,
        description='CAD drawing or engineering reference code',
        examples=['DWG-SS-BRK-001-REV2']
    )
    special_processes: Optional[List[str]] = Field(
        default_factory=list,
        description='Specific required industrial manufacturing processes',
        examples=[['Fiber Laser Cutting', 'CNC Press Brake Bending', 'Deburring']]
    )

class FactoryMatchRequest(BaseModel):
    rfq_title: str = Field(
        ...,
        description='Title or summary of the RFQ batch to be outsourced',
        examples=['Solar Inverter Enclosure Chassis']
    )
    material_grade: str = Field(
        ...,
        description='Engineering material grade required',
        examples=['SS304']
    )
    quantity: int = Field(
        ...,
        ge=1,
        description='Target manufacturing quantity',
        examples=[500]
    )
    required_delivery_days: int = Field(
        ...,
        ge=1,
        description='Maximum acceptable turnaround lead time in calendar days',
        examples=[7]
    )
    target_budget: Optional[float] = Field(
        default=None,
        ge=0.0,
        description='Target procurement budget in INR',
        examples=[45000.0]
    )
    required_processes: Optional[List[str]] = Field(
        default_factory=list,
        description='Mandatory factory capabilities and machines required',
        examples=[['Fiber Laser Cutting', 'CNC Bending', 'Powder Coating']]
    )
    buyer_preference: Optional[str] = Field(
        default='balanced',
        description='Optimization priority: balanced | cost | quality | speed',
        examples=['balanced', 'cost', 'speed']
    )

class ProductionRecommendationRequest(BaseModel):
    job_id: str = Field(
        ...,
        description='Internal production job identifier',
        examples=['JOB-1082']
    )
    part_name: str = Field(
        ...,
        description='Component part title or description',
        examples=['Solar Inverter Mounting Baseplate']
    )
    quantity: int = Field(
        ...,
        ge=1,
        description='Scheduled batch production quantity',
        examples=[250]
    )
    target_deadline: str = Field(
        ...,
        description='ISO 8601 target completion deadline timestamp',
        examples=['2026-09-18T18:00:00Z']
    )
    required_processes: List[str] = Field(
        ...,
        description='Ordered sequence of shop-floor manufacturing operations',
        examples=[['Fiber Laser Cutting', 'CNC Press Brake Bending', 'QC Inspection']]
    )

class DocumentIngestionRequest(BaseModel):
    document_title: str = Field(
        ...,
        description='Official title or designation of the technical documentation',
        examples=['Amada HFE 3i CNC Press Brake Tooling & Tonnage Manual']
    )
    document_type: str = Field(
        ...,
        description='Classification category: manual | machine_spec | material_spec | policy | contract',
        examples=['machine_spec', 'material_spec']
    )
    content_text: str = Field(
        ...,
        description='Full extracted text content to be chunked, embedded, and indexed',
        examples=['V-die opening should be 8x material thickness for mild steel and stainless steel. Minimum flange length is 6x thickness.']
    )
    source_url: Optional[str] = Field(
        default=None,
        description='Original reference URL or document storage URI',
        examples=['https://docs.forgeiq.internal/manuals/amada-hfe-3i.pdf']
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description='Custom metadata tags for filtered retrieval',
        examples=[{"machine_model": "Amada HFE 3i", "tonnage_kn": 1000}]
    )
