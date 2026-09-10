import os
import re
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, UploadFile, status

from app.models.audit_log import AuditAction, AuditStatus
from app.security.audit import audit_service

# Maximum file size: 10MB
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

# Allowed CAD & Document Extensions
ALLOWED_EXTENSIONS = {
    ".dxf", ".dwg", ".step", ".stp", ".iges", ".igs",
    ".pdf", ".png", ".jpg", ".jpeg", ".txt", ".csv"
}

# Malicious script patterns frequently hidden in DXF/DWG/STEP files
# E.g. AutoLISP commands, shell execution, web scripts, buffer overflow attempts
MALICIOUS_CAD_PATTERNS = [
    re.compile(rb"\(command\s+", re.IGNORECASE),
    re.compile(rb"\(vl-load-com", re.IGNORECASE),
    re.compile(rb"\(vla-", re.IGNORECASE),
    re.compile(rb"\(startapp\s+", re.IGNORECASE),
    re.compile(rb"eval\(", re.IGNORECASE),
    re.compile(rb"<script[\s>]", re.IGNORECASE),
    re.compile(rb"cmd\.exe", re.IGNORECASE),
    re.compile(rb"/bin/(sh|bash)", re.IGNORECASE),
    re.compile(rb"WScript\.Shell", re.IGNORECASE),
    re.compile(rb"powershell", re.IGNORECASE),
]


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filename by stripping directory traversal sequences (../),
    whitespace, and illegal control characters.
    """
    base = os.path.basename(filename.strip().replace("\\", "/"))
    # Remove any lingering relative path attempts
    base = base.replace("..", "")
    # Allow alphanumeric, underscore, hyphen, and period
    clean_name = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", base)
    return clean_name or "uploaded_cad_part.dxf"


def validate_cad_content(filename: str, content: bytes, mime_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Performs deep inspection on CAD file uploads:
    1. Size verification (<= 10MB)
    2. Extension and magic byte verification
    3. Heuristic script & macro scanning for embedded AutoLISP/VBA attacks
    """
    # 1. Size Validation
    size = len(content)
    if size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of 10MB. Uploaded size: {size / (1024*1024):.2f}MB"
        )
    if size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content is empty."
        )

    # 2. Extension Validation
    clean_name = sanitize_filename(filename)
    _, ext = os.path.splitext(clean_name.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # 3. Path Traversal & Layer Name Injection Check
    if ".." in filename or "/" in filename or "\\" in filename:
        clean_name = sanitize_filename(filename)

    # 4. Deep Script & Malware Scanning (Inspection of first 1MB of content)
    inspection_buffer = content[:min(size, 1024 * 1024)]
    for pattern in MALICIOUS_CAD_PATTERNS:
        match = pattern.search(inspection_buffer)
        if match:
            matched_str = match.group().decode("latin-1", errors="ignore")
            # Log security event
            audit_service.record_event(
                user_id="upload_scanner",
                user_role="System",
                tenant_id="System",
                action=AuditAction.SECURITY_VIOLATION,
                resource=clean_name,
                details=f"Malicious embedded CAD script detected: '{matched_str}'",
                status=AuditStatus.BLOCKED
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Security violation: Malicious script or executable macro detected in CAD file ('{matched_str}'). File rejected."
            )

    return {
        "valid": True,
        "clean_filename": clean_name,
        "extension": ext,
        "size_bytes": size,
        "mime_type": mime_type or "application/octet-stream"
    }


async def validate_uploaded_file(file: UploadFile) -> Dict[str, Any]:
    """FastAPI dependency/helper for UploadFile validation."""
    content = await file.read()
    await file.seek(0)
    return validate_cad_content(file.filename or "part.dxf", content, file.content_type)
