import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.api.chat import router as chat_router
from app.api.rfq import router as rfq_router
from app.api.quotation import router as quotation_router
from app.api.production import router as production_router
from app.api.recommendations import router as recommendations_router
from app.api.documents import router as documents_router
from app.api.rag import router as rag_router
from app.api.telemetry import router as telemetry_router

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger('forgeiq.main')

app = FastAPI(
    title="ForgeIQ AI Engine",
    description="Production Multi-Agent AI & RAG Microservice for ForgeIQ Manufacturing Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware to allow Next.js server actions and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled AI exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "AI service temporarily unavailable. Please fallback to rule-based operations.",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else None
        }
    )

# Health & Status Check
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "ForgeIQ AI Engine",
        "provider": settings.AI_PROVIDER,
        "environment": settings.ENVIRONMENT,
        "vector_backend": settings.VECTOR_BACKEND
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "ForgeIQ Production AI Microservice Active",
        "docs": "/docs",
        "health": "/health"
    }

# Mount API Routers
app.include_router(chat_router)
app.include_router(rfq_router)
app.include_router(quotation_router)
app.include_router(production_router)
app.include_router(recommendations_router)
app.include_router(documents_router)
app.include_router(rag_router)
app.include_router(telemetry_router)
