"""
ForgeIQ CAD Analysis API Endpoints.
Provides REST interface for parsing 2D DXF fabrication drawings,
extracting manufacturing telemetry, and serving synchronized vector previews.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from typing import Optional, Dict, Any
from app.cad.cad_service import CadService

router = APIRouter(prefix="/api/v1/cad", tags=["CAD Analysis"])


@router.post("/analyze")
async def analyze_cad_drawing(
    file: Optional[UploadFile] = File(None),
    raw_content: Optional[str] = Form(None),
    file_name: Optional[str] = Form(None),
) -> Dict[str, Any]:
    """
    Analyzes an uploaded DXF drawing or raw DXF string.
    Returns exact bounding envelope, cut perimeter, holes, bends, welds,
    material, mass, complexity, confidence, and vector preview primitives.
    """
    try:
        if file is not None:
            content_bytes = await file.read()
            name = file.filename or "uploaded_drawing.dxf"
            return CadService.analyze_dxf(content_bytes, file_name=name)

        if raw_content:
            name = file_name or "drawing.dxf"
            return CadService.analyze_dxf(raw_content, file_name=name)

        raise HTTPException(status_code=400, detail="Either a file upload or raw_content must be provided.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CAD analysis failed: {str(e)}")


@router.post("/analyze-json")
async def analyze_cad_json(
    payload: Dict[str, Any] = Body(...),
) -> Dict[str, Any]:
    """
    JSON endpoint accepting { "dxf_content": str, "file_name": str }.
    """
    try:
        dxf_content = payload.get("dxf_content") or payload.get("content")
        file_name = payload.get("file_name") or "drawing.dxf"

        if not dxf_content:
            raise HTTPException(status_code=400, detail="dxf_content is required.")

        return CadService.analyze_dxf(dxf_content, file_name=file_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CAD analysis failed: {str(e)}")
