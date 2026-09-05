from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.models.responses import APIEnvelope
from app.models.schemas import RAGCitation
from app.security.auth import get_tenant_context, TenantContext
from app.rag.retrieval import rag_retriever

router = APIRouter(prefix="/api/v1/rag", tags=["RAG Retrieval"])

@router.get("/search", response_model=APIEnvelope[List[RAGCitation]])
async def rag_search(
    q: str = Query(..., description="Semantic search query"),
    source_type: Optional[str] = Query(None, description="Optional filter by document type"),
    top_k: int = Query(4, ge=1, le=20),
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Direct semantic context retrieval.
    Enforces that only citations matching tenant.org_id are returned.
    """
    citations = rag_retriever.retrieve_context(
        query=q,
        tenant=tenant,
        source_type=source_type,
        top_k=top_k
    )
    return APIEnvelope(
        success=True,
        data=citations,
        provider_used="vector_retrieval"
    )
