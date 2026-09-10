from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.models.responses import APIEnvelope, COMMON_ERROR_RESPONSES
from app.models.schemas import RAGCitation
from app.security.auth import get_tenant_context, TenantContext
from app.rag.retrieval import rag_retriever

router = APIRouter(prefix="/api/v1/rag", tags=["RAG Retrieval"])

@router.get(
    "/search",
    response_model=APIEnvelope[List[RAGCitation]],
    summary="Semantic & Lexical Knowledge Base Context Search",
    description="""
Direct semantic retrieval engine querying tenant-isolated engineering documents, machine specifications,
material price books, and standard operating procedures.
- Hybrid search combining 384-dimensional cosine similarity with lexical keyword boosting
- Filterable by `source_type` (e.g. `machine_spec`, `material_spec`, `manual`, `policy`)
- Results are ranked in descending order of `relevance_score`
- Cross-tenant boundaries are strictly enforced via `X-Org-ID`.
    """,
    responses=COMMON_ERROR_RESPONSES
)
async def rag_search(
    q: str = Query(..., description="Semantic search query string", examples=["What is the minimum bend radius for 3mm SS304 sheet metal?"]),
    source_type: Optional[str] = Query(None, description="Optional document classification filter", examples=["machine_spec", "material_spec"]),
    top_k: int = Query(4, ge=1, le=20, description="Maximum number of context snippets to return", examples=[4]),
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
