import uuid
import re
from typing import List
from app.rag.embeddings import embedding_service
from app.rag.vector_store import vector_store, VectorRecord
from app.models.requests import DocumentIngestionRequest
from app.models.responses import IngestionResponse
from app.security.auth import TenantContext

class IngestionPipeline:
    def chunk_text(self, text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
        """Splits document text into clean semantic chunks."""
        cleaned = re.sub(r'\s+', ' ', text).strip()
        if len(cleaned) <= chunk_size:
            return [cleaned] if cleaned else []

        chunks = []
        start = 0
        while start < len(cleaned):
            end = start + chunk_size
            if end < len(cleaned):
                # Try finding a natural punctuation or sentence break
                break_point = max(
                    cleaned.rfind('. ', start, end),
                    cleaned.rfind('\n', start, end),
                    cleaned.rfind('; ', start, end),
                )
                if break_point > start:
                    end = break_point + 1

            chunk = cleaned[start:end].strip()
            if chunk:
                chunks.append(chunk)
            start = end - overlap if end < len(cleaned) else len(cleaned)

        return chunks

    def ingest_document(
        self,
        request: DocumentIngestionRequest,
        tenant: TenantContext
    ) -> IngestionResponse:
        """
        Validates, chunks, generates embeddings, and securely stores vector records
        with tenant org_id tagging.
        """
        doc_id = f"doc_{uuid.uuid4().hex[:10]}"
        chunks = self.chunk_text(request.content_text)
        if not chunks:
            chunks = [request.content_text]

        records: List[VectorRecord] = []
        for idx, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_c{idx}"
            embedding = embedding_service.get_embedding(chunk)
            
            record = VectorRecord(
                id=chunk_id,
                org_id=tenant.org_id,
                customer_id=tenant.customer_id,
                source_id=doc_id,
                source_title=request.document_title,
                source_type=request.document_type,
                content=chunk,
                embedding=embedding,
                metadata={
                    "chunk_index": idx,
                    "total_chunks": len(chunks),
                    "source_url": request.source_url,
                    **request.metadata
                }
            )
            records.append(record)

        vector_store.add_records(records)

        return IngestionResponse(
            document_id=doc_id,
            chunks_created=len(chunks),
            embeddings_generated=len(records),
            org_id=tenant.org_id,
            status='indexed'
        )

ingestion_pipeline = IngestionPipeline()
