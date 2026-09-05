import pytest
from app.agents.orchestrator import orchestrator
from app.security.auth import TenantContext

@pytest.mark.asyncio
async def test_orchestrator_routes_production_query():
    tenant = TenantContext(org_id="org-forge-default", user_id="manager-1", user_role="manager")
    res = await orchestrator.process_query(
        query="Can we accept another 500-unit laser cutting order this week?",
        tenant=tenant
    )
    assert res.agent_routed == "Shop Floor Production Agent"
    assert len(res.supporting_evidence) > 0
    assert res.confidence >= 0.85
    assert res.requires_approval is True

@pytest.mark.asyncio
async def test_orchestrator_routes_inventory_query():
    tenant = TenantContext(org_id="org-forge-default", user_id="manager-1", user_role="manager")
    res = await orchestrator.process_query(
        query="How much 304 stainless steel sheet metal is in stock?",
        tenant=tenant
    )
    assert res.agent_routed == "Raw Material & Inventory Agent"
    assert any("304" in ev.metric_name for ev in res.supporting_evidence)

@pytest.mark.asyncio
async def test_orchestrator_routes_buyer_query():
    tenant = TenantContext(org_id="org-forge-default", user_id="cust-1", user_role="customer", customer_id="cust-01")
    res = await orchestrator.process_query(
        query="Where is my order PO-2026-0492?",
        tenant=tenant
    )
    assert res.agent_routed == "Customer Experience & Order Tracking Agent"
    assert "Milestone" in res.supporting_evidence[0].metric_name
