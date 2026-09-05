import time
import uuid
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.agents.production_agent import ProductionAgent
from app.agents.inventory_agent import InventoryAgent
from app.agents.quotation_agent import QuotationAgent
from app.agents.buyer_agent import BuyerAgent
from app.agents.analytics_agent import AnalyticsAgent
from app.models.schemas import CopilotResponse, TelemetryRecord
from app.security.auth import TenantContext
from app.rag.retrieval import rag_retriever
from app.services.telemetry_service import telemetry_service

class AgentOrchestrator:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {
            "production": ProductionAgent(),
            "inventory": InventoryAgent(),
            "quotation": QuotationAgent(),
            "buyer": BuyerAgent(),
            "analytics": AnalyticsAgent(),
        }

    def route_intent(self, query: str, tenant: TenantContext) -> BaseAgent:
        """Determines the most specialized domain agent for the query."""
        lower = query.lower()

        # If customer portal context
        if tenant.customer_id:
            return self.agents["buyer"]

        if any(w in lower for w in ['capacity', 'schedule', 'bottleneck', 'shift', 'machine', 'accept', 'can we take', 'can we accept']):
            return self.agents["production"]

        if any(w in lower for w in ['stock', 'material', 'sheet', 'inventory', 'reorder', 'warehouse', 'raw metal']):
            return self.agents["inventory"]

        if any(w in lower for w in ['estimate', 'quote', 'cutting time', 'cycle time', 'scrap', 'labor cost', 'cam']):
            return self.agents["quotation"]

        if any(w in lower for w in ['profit', 'revenue', 'margin', 'loss', 'cost', 'expensive', 'variance', 'cogs', 'overtime']):
            return self.agents["analytics"]

        if any(w in lower for w in ['where', 'order status', 'tracking', 'buyer', 'delivery eta']):
            return self.agents["buyer"]

        # Default to production operations
        return self.agents["production"]

    async def process_query(
        self,
        query: str,
        tenant: TenantContext,
        context: Dict[str, Any] = None
    ) -> CopilotResponse:
        start_time = time.time()
        req_id = f"req_{uuid.uuid4().hex[:8]}"
        ctx = context or {}

        # 1. RAG Retrieval strictly scoped to requesting organization
        citations = rag_retriever.retrieve_context(
            query=query,
            tenant=tenant,
            top_k=4
        )

        # 2. Multi-Agent Routing
        selected_agent = self.route_intent(query, tenant)

        # 3. Agent Execution
        try:
            response = await selected_agent.handle_query(
                query=query,
                tenant=tenant,
                citations=citations,
                context=ctx
            )
            elapsed_ms = (time.time() - start_time) * 1000.0
            response.latency_ms = round(elapsed_ms, 1)

            # 4. Telemetry Recording
            telemetry_service.record(
                TelemetryRecord(
                    request_id=req_id,
                    org_id=tenant.org_id,
                    user_id=tenant.user_id,
                    endpoint="/api/v1/chat/completions",
                    agent_used=selected_agent.agent_id,
                    provider=response.provider_used,
                    model=response.provider_used,
                    latency_ms=response.latency_ms,
                    confidence=response.confidence,
                    success=True
                )
            )

            return response

        except Exception as err:
            elapsed_ms = (time.time() - start_time) * 1000.0
            telemetry_service.record(
                TelemetryRecord(
                    request_id=req_id,
                    org_id=tenant.org_id,
                    user_id=tenant.user_id,
                    endpoint="/api/v1/chat/completions",
                    agent_used=selected_agent.agent_id,
                    provider="error",
                    model="error",
                    latency_ms=round(elapsed_ms, 1),
                    confidence=0.0,
                    success=False,
                    error_message=str(err)
                )
            )
            raise err

orchestrator = AgentOrchestrator()
