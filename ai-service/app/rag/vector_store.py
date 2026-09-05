import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.models.schemas import RAGCitation

class VectorRecord(BaseModel):
    id: str
    org_id: str  # MANDATORY tenant identifier
    customer_id: Optional[str] = None  # If scoped to specific buyer customer
    source_id: str
    source_title: str
    source_type: str
    content: str
    embedding: List[float]
    metadata: Dict[str, Any] = {}

class VectorStore:
    def __init__(self):
        self._records: List[VectorRecord] = []

    def add_records(self, records: List[VectorRecord]):
        for r in records:
            if not r.org_id:
                raise ValueError("Cannot index vector record without an org_id tenant identifier")
        self._records.extend(records)

    def search(
        self,
        query_embedding: List[float],
        org_id: str,
        customer_id: Optional[str] = None,
        source_type: Optional[str] = None,
        top_k: int = 5,
        min_score: float = 0.25,
    ) -> List[RAGCitation]:
        """
        STRICT MULTI-TENANT ISOLATION:
        Only records matching org_id are ever evaluated.
        If customer_id is provided, only records for that customer or public marketplace are returned.
        """
        if not org_id:
            raise ValueError("Tenant org_id is required for vector search")

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            return []

        results: List[tuple[float, VectorRecord]] = []

        for record in self._records:
            # 1. Mandatory Organization Guard
            if record.org_id != org_id and record.org_id != 'system_public':
                continue

            # 2. Customer Isolation Guard (if querying in customer context)
            if customer_id and record.customer_id and record.customer_id != customer_id:
                continue

            # 3. Source Type filter
            if source_type and record.source_type != source_type:
                continue

            # 4. Cosine similarity
            r_vec = np.array(record.embedding, dtype=np.float32)
            denom = q_norm * np.linalg.norm(r_vec)
            if denom == 0:
                continue
            sim = float(np.dot(q_vec, r_vec) / denom)

            if sim >= min_score:
                results.append((sim, record))

        # Sort descending by score
        results.sort(key=lambda x: x[0], reverse=True)
        top_results = results[:top_k]

        citations = [
            RAGCitation(
                source_id=rec.source_id,
                source_title=rec.source_title,
                source_type=rec.source_type,
                relevance_score=round(score, 3),
                snippet=rec.content[:280] + ('...' if len(rec.content) > 280 else ''),
                org_id=rec.org_id
            )
            for score, rec in top_results
        ]

        return citations

# Global vector store instance with initial seed manufacturing knowledge base
vector_store = VectorStore()

def seed_default_knowledge_base():
    """Initializes standard baseline manufacturing data for default tenant."""
    from app.rag.embeddings import embedding_service

    seed_docs = [
        {
            "id": "kb-1",
            "org_id": "org-forge-default",
            "source_id": "DOC-MAT-304",
            "source_title": "304 Stainless Steel Machining Specifications",
            "source_type": "material_spec",
            "content": "304 Stainless Steel has density 8.0 g/cm3. Recommended laser cutting speed on 3mm sheet is 3.8 - 4.2 m/min using Nitrogen assist gas at 14 bar pressure to avoid burrs. Bending radius minimum 1.5x thickness.",
        },
        {
            "id": "kb-2",
            "org_id": "org-forge-default",
            "source_id": "DOC-MACH-01",
            "source_title": "Bystronic 6kW Fiber Laser Specifications & Hourly Rates",
            "source_type": "machine",
            "content": "Bystronic ByStar 6000W Fiber Laser: Bed size 3000x1500mm. Standard shop operating rate is ₹3,200 per operating hour. Current weekly utilization is 68%. Open capacity available on weekday second shift.",
        },
        {
            "id": "kb-3",
            "org_id": "org-forge-default",
            "source_id": "DOC-INV-01",
            "source_title": "Raw Sheet Metal Stock Registry",
            "source_type": "inventory",
            "content": "Current inventory has 840 kg of 304 SS sheet (3mm x 1250 x 2500 mm, 32 sheets in stock). CR4 Mild Steel 2mm: 1,200 kg in stock. Reorder lead time is 48 hours from Jindal Steel.",
        },
        {
            "id": "kb-4",
            "org_id": "org-forge-default",
            "customer_id": "cust-01",
            "source_id": "PO-2026-0492",
            "source_title": "Purchase Order PO-2026-0492 - NexaSolar Brackets",
            "source_type": "order",
            "content": "Order PO-2026-0492 for 500 pcs Solar Inverter Chassis Bracket is currently in Stage 3: CNC Press Brake Bending. 340/500 units bent. Estimated delivery Tuesday at 3:00 PM.",
        }
    ]

    records = [
        VectorRecord(
            id=d["id"],
            org_id=d["org_id"],
            customer_id=d.get("customer_id"),
            source_id=d["source_id"],
            source_title=d["source_title"],
            source_type=d["source_type"],
            content=d["content"],
            embedding=embedding_service.get_embedding(d["content"]),
            metadata={"seed": True}
        )
        for d in seed_docs
    ]
    vector_store.add_records(records)

seed_default_knowledge_base()
