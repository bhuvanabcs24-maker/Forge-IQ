import abc
from typing import Dict, Any, List
from app.models.schemas import CopilotResponse, AgentEvidence, RAGCitation
from app.security.auth import TenantContext

class BaseAgent(abc.ABC):
    agent_id: str
    name: str
    description: str

    @abc.abstractmethod
    async def handle_query(
        self,
        query: str,
        tenant: TenantContext,
        citations: List[RAGCitation],
        context: Dict[str, Any]
    ) -> CopilotResponse:
        """Processes the query with tenant authorization and RAG citations."""
        pass
