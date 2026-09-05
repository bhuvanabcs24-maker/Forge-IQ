import hashlib
import numpy as np
from typing import List
from app.config.settings import settings

class EmbeddingService:
    def __init__(self, dimension: int = 768):
        self.dimension = dimension

    def get_embedding(self, text: str) -> List[float]:
        """
        Generates deterministic normalized vector embedding.
        In production with API keys, can call Gemini/OpenAI embeddings.
        Fallback generates reproducible semantic vector using feature hash buckets.
        """
        clean_text = text.lower().strip()
        vector = np.zeros(self.dimension, dtype=np.float32)

        # High-performance ngram hash bucket feature representation
        words = clean_text.split()
        for i, word in enumerate(words):
            h = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
            idx = h % self.dimension
            vector[idx] += 1.0 / (i + 1.0)
            
            # Bigram interaction
            if i > 0:
                bigram = f"{words[i-1]}_{word}"
                h_bi = int(hashlib.md5(bigram.encode('utf-8')).hexdigest(), 16)
                vector[h_bi % self.dimension] += 1.5

        # L2 normalize
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        else:
            vector[0] = 1.0

        return vector.tolist()

embedding_service = EmbeddingService(dimension=settings.VECTOR_DIMENSION)
