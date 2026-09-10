"""
ForgeIQ Data Pipeline - Deduplication & Leakage Prevention Engine
Implements Section 19:
- Exact & near-duplicate prompt rejection.
- Cross-split contamination check (train/validation/test/golden).
"""

import re
import hashlib
from typing import Set, Dict, Any, List

def compute_prompt_hash(text: str) -> str:
    """Normalizes whitespace, lowercases, removes punctuation, and hashes."""
    clean = re.sub(r"[^\w\s]", "", text.lower()).strip()
    clean = re.sub(r"\s+", " ", clean)
    return hashlib.sha256(clean.encode("utf-8")).hexdigest()

class DeduplicationEngine:
    def __init__(self):
        self.seen_train_hashes: Set[str] = set()
        self.seen_eval_hashes: Set[str] = set()

    def add_train_sample(self, user_query: str) -> bool:
        """Returns True if sample is novel, False if duplicate."""
        h = compute_prompt_hash(user_query)
        if h in self.seen_train_hashes or h in self.seen_eval_hashes:
            return False
        self.seen_train_hashes.add(h)
        return True

    def register_eval_sample(self, user_query: str):
        h = compute_prompt_hash(user_query)
        self.seen_eval_hashes.add(h)

    def check_leakage(self, user_query: str) -> bool:
        """Returns True if this query leaks into evaluation/test splits."""
        h = compute_prompt_hash(user_query)
        return h in self.seen_eval_hashes
