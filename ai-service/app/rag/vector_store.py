import os
import json
from pathlib import Path
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
        # Overwrite or append uniquely by ID and content signature
        existing_id_map = {rec.id: i for i, rec in enumerate(self._records)}
        existing_sig_map = {(rec.source_title.strip().lower(), rec.content[:100].strip().lower(), rec.org_id): i for i, rec in enumerate(self._records)}
        
        for r in records:
            sig = (r.source_title.strip().lower(), r.content[:100].strip().lower(), r.org_id)
            if r.id in existing_id_map:
                idx = existing_id_map[r.id]
                self._records[idx] = r
            elif sig in existing_sig_map:
                idx = existing_sig_map[sig]
                self._records[idx] = r
                existing_id_map[r.id] = idx
            else:
                self._records.append(r)
                new_idx = len(self._records) - 1
                existing_id_map[r.id] = new_idx
                existing_sig_map[sig] = new_idx

    def save_to_disk(self, file_path: str):
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)
        data = [r.model_dump() for r in self._records]
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)

    def load_from_disk(self, file_path: str):
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            records = [VectorRecord.model_validate(item) for item in data]
            self.add_records(records)

    def search(
        self,
        query_embedding: List[float],
        org_id: str,
        query_text: Optional[str] = None,
        customer_id: Optional[str] = None,
        source_type: Optional[str] = None,
        top_k: int = 5,
        min_score: float = 0.25,
    ) -> List[RAGCitation]:
        """
        STRICT MULTI-TENANT ISOLATION with Hybrid Semantic + Lexical Scoring:
        Only records matching org_id are ever evaluated.
        If customer_id is provided, only records for that customer or public marketplace are returned.
        """
        if not org_id:
            raise ValueError("Tenant org_id is required for vector search")

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            return []

        # Prepare lexical terms if query_text is present
        stop_words = {'what', 'is', 'are', 'the', 'for', 'and', 'can', 'we', 'our', 'of', 'in', 'to', 'a', 'an'}
        q_tokens = set()
        if query_text:
            q_tokens = {w for w in query_text.lower().replace('?', '').replace(',', '').split() if w not in stop_words and len(w) > 2}

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

            # 5. Hybrid Lexical Keyword Boost
            if q_tokens:
                c_text = record.content.lower()
                t_text = record.source_title.lower()
                lex_score = sum(1 for w in q_tokens if w in c_text) + 2.5 * sum(1 for w in q_tokens if w in t_text)
                sim += 0.08 * lex_score

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
                snippet=rec.content[:1500] + ('...' if len(rec.content) > 1500 else ''),
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
    
    # Auto-load rich trained knowledge base if persisted
    trained_kb = Path(__file__).resolve().parent.parent.parent / "data" / "trained_knowledge_records.json"
    if trained_kb.exists():
        vector_store.load_from_disk(str(trained_kb))

seed_default_knowledge_base()
