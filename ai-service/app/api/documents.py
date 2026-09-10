from fastapi import APIRouter, Depends
from app.models.requests import DocumentIngestionRequest
from app.models.responses import APIEnvelope, IngestionResponse, COMMON_ERROR_RESPONSES
from app.security.auth import get_tenant_context, TenantContext
from app.rag.ingestion import ingestion_pipeline

router = APIRouter(prefix="/api/v1/documents", tags=["Document Ingestion"])

@router.post(
    "/ingest",
    response_model=APIEnvelope[IngestionResponse],
    summary="Ingest Technical Documentation into Tenant Knowledge Store",
    description="""
Chunks, embeds, and indexes engineering drawings, OEM manuals, material specs, or factory policies
into tenant-isolated vector storage. All ingested data is strictly isolated to `tenant.org_id`.
    """,
    responses=COMMON_ERROR_RESPONSES
)
async def ingest_document(
    req: DocumentIngestionRequest,
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Ingests technical drawings, specs, machine manuals, or commercial docs
    into tenant-isolated vector storage.
    """
    res = ingestion_pipeline.ingest_document(req, tenant)
    return APIEnvelope(
        success=True,
        data=res,
        provider_used="vector_ingestion"
    )
