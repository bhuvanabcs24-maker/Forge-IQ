from typing import List, Optional
from app.rag.embeddings import embedding_service
from app.rag.vector_store import vector_store
from app.models.schemas import RAGCitation
from app.security.auth import TenantContext

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
        to the requesting tenant.
        """
        query_embedding = embedding_service.get_embedding(query)
        
        citations = vector_store.search(
            query_embedding=query_embedding,
            org_id=tenant.org_id,
            customer_id=tenant.customer_id,
            source_type=source_type,
            top_k=top_k,
            min_score=0.20
        )
        return citations

    def format_context_prompt(self, citations: List[RAGCitation]) -> str:
        """Formats citations into a clean context prompt for the LLM."""
        if not citations:
            return ""

        lines = ["=== RELEVANT FORGEIQ BUSINESS CONTEXT ==="]
        for c in citations:
            lines.append(f"[{c.source_type.upper()}] {c.source_title} (Relevance: {c.relevance_score:.2f}):")
            lines.append(f"{c.snippet}\n")
        lines.append("=========================================")
        return "\n".join(lines)

rag_retriever = RAGRetriever()
