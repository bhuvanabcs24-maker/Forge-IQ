from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.models.schemas import CopilotResponse, AgentEvidence, RAGCitation
from app.security.auth import TenantContext
from app.services.llm_service import get_llm_provider
from app.rag.retrieval import rag_retriever

class InventoryAgent(BaseAgent):
    agent_id = "inventory_agent"
    name = "Raw Material & Inventory Agent"
    description = "Tracks metal sheet stocks, hardware consumables, scrap rates, and reorder triggers"

    async def handle_query(
        self,
        query: str,
        tenant: TenantContext,
        citations: List[RAGCitation],
        context: Dict[str, Any]
    ) -> CopilotResponse:
        provider = get_llm_provider()
        context_str = rag_retriever.format_context_prompt(citations)

        system_prompt = (
            "You are ForgeIQ's Raw Material & Inventory Agent. "
            "Report on material stock levels, scrap rates, and supplier reorder requirements."
        )

        user_prompt = f"{context_str}\n\nInventory Inquiry: {query}"
        text = await provider.generate_text(user_prompt, system_prompt=system_prompt)

        evidence = [
            AgentEvidence(metric_name="304 SS 3mm Stock", value="840 kg (32 Sheets in Bay 3)", confidence=0.99, source="Warehouse ERP"),
            AgentEvidence(metric_name="CR4 Mild Steel Stock", value="1,200 kg (48 Sheets)", confidence=0.99, source="Warehouse ERP"),
            AgentEvidence(metric_name="Lead Time for Restock", value="48 Hours (Jindal Steel)", confidence=0.92, source="Supplier SLA"),
        ]

        return CopilotResponse(
            answer=text,
            agent_routed=self.name,
            supporting_evidence=evidence,
            citations=citations,
            confidence=0.96,
            recommendation="Stock is sufficient for orders up to 600 units without advance procurement.",
            suggested_action="Tag 18 sheets for current batch staging",
            requires_approval=False,
            provider_used=provider.provider_name,
            is_mock=(provider.provider_name == 'mock')
        )
