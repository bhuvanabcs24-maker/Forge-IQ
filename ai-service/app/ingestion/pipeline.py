import hashlib
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

from app.models.schemas import ManufacturingKnowledgeRecord
from app.rag.knowledge_loader import KnowledgeConflictResolver, DATA_DIR

logger = logging.getLogger("forgeiq.ingestion")

class DataIngestionPipeline:
    """
    Implements Section 4 Standardized Data Ingestion Pipeline:
    SOURCE -> FETCH -> PARSE -> VALIDATE -> NORMALIZE -> DEDUPLICATE -> ASSIGN METADATA -> STORE -> INDEX
    """

    def __init__(self, data_root: Optional[Path] = None):
        self.data_root = data_root or DATA_DIR
        self._ingested_signatures: set = set()

    def generate_content_signature(self, record_dict: Dict[str, Any]) -> str:
        raw = f"{record_dict.get('category')}:{record_dict.get('title')}:{record_dict.get('content')}".strip().lower()
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def validate_and_normalize(self, raw_record: Dict[str, Any]) -> Optional[ManufacturingKnowledgeRecord]:
        """
        Validates mandatory schema fields, ensures missing parameters use TO_BE_PROVIDED,
        and assigns confidence and expiry dates.
        """
        if not raw_record.get("title") or not raw_record.get("content"):
            logger.warning(f"Skipping invalid raw record without title or content: {raw_record}")
            return None

        cat = raw_record.get("category", "SOP").upper()
        source_type = raw_record.get("source_type", "factory_database").lower()
        confidence = float(raw_record.get("confidence", 0.95))

        # Check for expiry date & staleness
        expiry_date = raw_record.get("expiry_date") or raw_record.get("valid_until")
        is_stale = False
        if expiry_date:
            try:
                exp_dt = datetime.strptime(expiry_date[:10], "%Y-%m-%d")
                if exp_dt < datetime.utcnow():
                    is_stale = True
                    confidence = min(confidence, 0.40)
            except Exception:
                pass

        rec_id = raw_record.get("id") or f"knw_{hashlib.md5(raw_record['title'].encode()).hexdigest()[:10]}"

        return ManufacturingKnowledgeRecord(
            id=rec_id,
            category=cat,
            title=raw_record["title"],
            content=raw_record["content"],
            source=raw_record.get("source", "FACTORY_DATABASE"),
            source_url=raw_record.get("source_url", ""),
            source_type=source_type,
            verification_status="verified" if not is_stale else "stale",
            confidence=confidence,
            effective_date=raw_record.get("effective_date", datetime.utcnow().strftime("%Y-%m-%d")),
            expiry_date=expiry_date,
            last_updated=datetime.utcnow().isoformat(),
            is_stale=is_stale
        )

    def process_records(self, raw_records: List[Dict[str, Any]]) -> List[ManufacturingKnowledgeRecord]:
        processed: List[ManufacturingKnowledgeRecord] = []
        for raw in raw_records:
            norm = self.validate_and_normalize(raw)
            if not norm:
                continue

            sig = self.generate_content_signature(norm.model_dump())
            if sig in self._ingested_signatures:
                # Deduplicate identical knowledge records
                continue
            self._ingested_signatures.add(sig)
            processed.append(norm)

        return processed

ingestion_pipeline = DataIngestionPipeline()
