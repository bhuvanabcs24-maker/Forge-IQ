"""
ForgeIQ Data Pipeline - Semantic Document Chunker for RAG
Implements Section 16 & 39:
Splits engineering standards, machine manuals, and SOPs into coherent semantic chunks
while preserving document hierarchy, section headings, and source attribution.
"""

import re
from typing import List, Dict, Any

def chunk_engineering_text(
    content: str,
    doc_id: str,
    source_title: str,
    source_type: str = "engineering_standard",
    target_chunk_tokens: int = 250
) -> List[Dict[str, Any]]:
    paragraphs = re.split(r"\n\s*\n", content.strip())
    chunks = []
    current_chunk = []
    current_length = 0
    chunk_idx = 1

    current_section = "General"

    for para in paragraphs:
        p = para.strip()
        if not p:
            continue
        # Heading detection
        if p.startswith("#") or (len(p) < 80 and p.endswith(":")):
            current_section = p.replace("#", "").strip()
            continue

        words = p.split()
        if current_length + len(words) > target_chunk_tokens and current_chunk:
            chunk_text = "\n\n".join(current_chunk)
            chunks.append({
                "chunk_id": f"{doc_id}_c{chunk_idx:03d}",
                "doc_id": doc_id,
                "source_title": source_title,
                "source_type": source_type,
                "section": current_section,
                "text": chunk_text,
                "token_estimate": current_length
            })
            chunk_idx += 1
            current_chunk = []
            current_length = 0

        current_chunk.append(p)
        current_length += len(words)

    if current_chunk:
        chunk_text = "\n\n".join(current_chunk)
        chunks.append({
            "chunk_id": f"{doc_id}_c{chunk_idx:03d}",
            "doc_id": doc_id,
            "source_title": source_title,
            "source_type": source_type,
            "section": current_section,
            "text": chunk_text,
            "token_estimate": current_length
        })

    return chunks
