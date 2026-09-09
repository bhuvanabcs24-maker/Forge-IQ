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
            "You are ForgeIQ's Business & Financial Analytics Agent, an expert in factory financial ledgers, "
            "job gross margins, machine OEE uptime, scrap cost variance, and hourly operating economics (in ₹ INR). "
            "Analyze financial and operational questions strictly utilizing the retrieved company ledgers, "
            "machine rate benchmarks (₹2,500/hr TRUMPF laser, ₹1,800/hr Amada brake), raw material index costs, "
            "and scrap recovery credit data in context. Always cite specific figures, currency values (₹ INR), and ledger sources."
        )

        user_prompt = (
            f"{context_str}\n\n"
            f"Financial/Operational Inquiry: {query}\n\n"
            f"Provide a structured financial and operational breakdown based on the business records above."
        )
        text = await provider.generate_text(user_prompt, system_prompt=system_prompt)
        is_mock = (provider.provider_name == 'mock') or not text

        if is_mock:
            evidence = [
                AgentEvidence(metric_name="Monthly Gross Revenue", value="₹12.4 Lakhs (+8% MoM)", confidence=0.99, source="Invoicing Ledger"),
                AgentEvidence(metric_name="Material Cost Ratio", value="54.2% of Revenue (+4.1% variance due to SS alloy price surge)", confidence=0.96, source="Procurement ERP"),
                AgentEvidence(metric_name="Overtime Labor Hours", value="42 hours (Machine Line #2 Maintenance)", confidence=0.95, source="Shift Attendance Ledger"),
            ]
        else:
            evidence = []
            for c in citations[:3]:
                evidence.append(
                    AgentEvidence(
                        metric_name=c.source_title[:32],
                        value=f"Relevance {c.relevance_score:.2f} ({c.source_type.replace('_', ' ').title()})",
                        confidence=min(1.0, max(0.88, round(c.relevance_score / 2.0, 2))),
                        source=c.source_id
                    )
                )
            if not evidence:
                evidence = [
                    AgentEvidence(metric_name="Financial Ledger", value="Live accounting & margin metrics", confidence=0.95, source="Invoicing Ledger")
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
            is_mock=is_mock
        )
