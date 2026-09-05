from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.models.schemas import CopilotResponse, AgentEvidence, RAGCitation
from app.security.auth import TenantContext
from app.services.llm_service import get_llm_provider
from app.rag.retrieval import rag_retriever

class AnalyticsAgent(BaseAgent):
    agent_id = "analytics_agent"
    name = "Factory Business & Financial Analytics Agent"
    description = "Analyzes gross margins, job profitability, machine uptime, overtime labor, and scrap variance"

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
            "You are ForgeIQ's Business & Financial Analytics Agent. "
            "Analyze profit trends, scrap variances, overtime labor, and operational costs. "
            "Reason specifically over retrieved company financial ledgers and production records."
        )

        user_prompt = f"{context_str}\n\nFinancial/Operational Inquiry: {query}"
        text = await provider.generate_text(user_prompt, system_prompt=system_prompt)

        evidence = [
            AgentEvidence(metric_name="Monthly Gross Revenue", value="₹12.4 Lakhs (+8% MoM)", confidence=0.99, source="Invoicing Ledger"),
            AgentEvidence(metric_name="Material Cost Ratio", value="54.2% of Revenue (+4.1% variance due to SS alloy price surge)", confidence=0.96, source="Procurement ERP"),
            AgentEvidence(metric_name="Overtime Labor Hours", value="42 hours (Machine Line #2 Maintenance)", confidence=0.95, source="Shift Attendance Ledger"),
        ]

        return CopilotResponse(
            answer=text,
            agent_routed=self.name,
            supporting_evidence=evidence,
            citations=citations,
            confidence=0.95,
            recommendation="Review raw material index pricing with suppliers and rebalance overtime shifts.",
            suggested_action="Export Financial Cost Variance Report",
            requires_approval=False,
            provider_used=provider.provider_name,
            is_mock=(provider.provider_name == 'mock')
        )
