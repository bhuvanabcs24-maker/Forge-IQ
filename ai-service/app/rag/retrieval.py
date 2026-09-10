import logging
import time
from typing import List, Optional
from app.rag.embeddings import embedding_service
from app.rag.vector_store import vector_store
from app.models.schemas import RAGCitation
from app.security.auth import TenantContext

logger = logging.getLogger("forgeiq.rag")

class RAGRetriever:
    def retrieve_context(
        self,
        query: str,
        tenant: TenantContext,
        source_type: Optional[str] = None,
        top_k: int = 4,
    ) -> List[RAGCitation]:
        """
        Retrieves relevant company and manufacturing knowledge strictly scoped
        to the requesting tenant with structured observability.
        """
        start_rag = time.perf_counter()
        logger.info(
            "RAG retrieval initiated",
            extra={
                "query": query,
                "top_k": top_k,
                "source_type": source_type,
                "org_id": tenant.org_id,
                "operation": "rag_retrieval"
            }
        )

        query_embedding = embedding_service.get_embedding(query)
        
        citations = vector_store.search(
            query_embedding=query_embedding,
            query_text=query,
            org_id=tenant.org_id,
            customer_id=tenant.customer_id,
            source_type=source_type,
            top_k=top_k,
            min_score=0.03
        )

        duration_ms = round((time.perf_counter() - start_rag) * 1000.0, 2)
        if duration_ms > 1000.0:
            logger.warning(
                f"SLOW RAG RETRIEVAL: search took {duration_ms}ms (>1000ms threshold)",
                extra={
                    "query": query,
                    "duration_ms": duration_ms,
                    "citations_count": len(citations),
                    "performance_warning": True,
                    "threshold_ms": 1000.0,
                    "operation": "rag_retrieval"
                }
            )

        logger.info(
            "RAG retrieval completed",
            extra={
                "query": query,
                "citations_count": len(citations),
                "top_scores": [round(c.relevance_score, 3) for c in citations[:3]],
                "duration_ms": duration_ms,
                "operation": "rag_retrieval"
            }
        )

        return citations

    def format_context_prompt(self, citations: List[RAGCitation]) -> str:
        """Formats citations into a clean, rich industrial context prompt for the LLM."""
        if not citations:
            return ""

        lines = ["=== VERIFIED INDUSTRIAL MANUFACTURING KNOWLEDGE BASE (RAG CONTEXT) ==="]
        for idx, c in enumerate(citations, 1):
            lines.append(f"--- Document #{idx}: [{c.source_type.upper()}] \"{c.source_title}\" (Source ID: {c.source_id}, Relevance: {c.relevance_score:.2f}) ---")
            lines.append(f"{c.snippet}\n")
        lines.append("=== END OF VERIFIED INDUSTRIAL MANUFACTURING CONTEXT ===")
        return "\n".join(lines)

rag_retriever = RAGRetriever()
