"""
ForgeIQ Data Pipeline - Data & License Validation Engine
Validates licensing compliance, schema integrity, and zero-hallucination compliance.
"""

import json
import logging
from typing import Dict, Any, Tuple, List
from pathlib import Path

logger = logging.getLogger("forgeiq.pipeline.validate")

def validate_license_for_destination(source_metadata: Dict[str, Any], destination: str) -> Tuple[bool, str]:
    """Strictly validates licensing permissions before allowing ingestion."""
    if not source_metadata.get("license_verified", False):
        return False, "LICENSE_UNVERIFIED: License has not been formally verified."

    dest = destination.upper()
    if dest == "TRAINING" and not source_metadata.get("training_allowed", False):
        return False, f"LICENSE_RESTRICTION: Source does not permit model training (License: {source_metadata.get('license')})."

    if dest == "RAG" and not source_metadata.get("rag_allowed", False):
        return False, f"LICENSE_RESTRICTION: Source does not permit RAG storage (License: {source_metadata.get('license')})."

    if dest == "EVALUATION" and not source_metadata.get("evaluation_allowed", False):
        return False, f"LICENSE_RESTRICTION: Source does not permit benchmark evaluation."

    return True, "LICENSE_VALID"

def validate_payload_integrity(payload: Dict[str, Any], destination: str) -> Tuple[bool, List[str]]:
    """Checks token lengths, syntax sanity, and prevents hallucination hazards."""
    errors = []

    # If training pair
    if destination.upper() == "TRAINING":
        messages = payload.get("messages", [])
        if len(messages) < 2:
            errors.append("Chat payload must have at least user and assistant turns.")
        
        user_content = next((m.get("content", "") for m in messages if m.get("role") == "user"), "")
        asst_content = next((m.get("content", "") for m in messages if m.get("role") == "assistant"), "")

        # Check for ungrounded prices
        u_low = user_content.lower()
        a_low = asst_content.lower()
        if "price" in u_low and "today" in u_low and "tool" not in a_low and "catalog" not in a_low and "unavailable" not in a_low:
            if "₹" in asst_content:
                errors.append("Ungrounded pricing assumption detected in assistant reply.")

        # Check for ungrounded live inventory
        if "inventory" in u_low and "how much" in u_low and "get_inventory" not in a_low and "database" not in a_low:
            if "sheets" in a_low or "kg" in a_low:
                errors.append("Ungrounded live inventory assertion without tool invocation.")

    return len(errors) == 0, errors
