import pytest
from app.rag.vector_store import VectorStore, VectorRecord
from app.rag.embeddings import embedding_service
from app.models.schemas import RAGCitation

def test_strict_organization_isolation():
    """
    CRITICAL SECURITY TEST:
    Verify that Organization B CANNOT retrieve Organization A's vector documents.
    """
    store = VectorStore()

    # Org A private document
    doc_a = VectorRecord(
        id="chunk_org_a_1",
        org_id="org_alpha_lasers",
        source_id="SECRET_DOC_A",
        source_title="Confidential Machine Cost Sheet",
        source_type="contract",
        content="Alpha Lasers negotiated special raw steel pricing at ₹42/kg with exclusive discount.",
        embedding=embedding_service.get_embedding("Alpha Lasers steel pricing contract discount"),
        metadata={}
    )

    # Org B private document
    doc_b = VectorRecord(
        id="chunk_org_b_1",
        org_id="org_beta_mfg",
        source_id="SECRET_DOC_B",
        source_title="Beta Manufacturing Production Secrets",
        source_type="manual",
        content="Beta Manufacturing runs 5-axis DMG Mori machines with secret tooling parameters.",
        embedding=embedding_service.get_embedding("Beta Manufacturing 5-axis tooling secrets"),
        metadata={}
    )

    store.add_records([doc_a, doc_b])

    # Query from Organization B asking about steel pricing or discounts
    query_emb = embedding_service.get_embedding("steel pricing contract discount")

    # Search as Org B
    results_for_b: list[RAGCitation] = store.search(
        query_embedding=query_emb,
        org_id="org_beta_mfg",
        top_k=5
    )

    # Verify: Org B must NOT see any of Org A's documents
    for res in results_for_b:
        assert res.org_id != "org_alpha_lasers", "CRITICAL FAILURE: Organization A data leaked to Organization B!"
        assert "Alpha Lasers" not in res.snippet

    # Search as Org A
    results_for_a: list[RAGCitation] = store.search(
        query_embedding=query_emb,
        org_id="org_alpha_lasers",
        top_k=5
    )

    assert len(results_for_a) >= 1
    assert results_for_a[0].org_id == "org_alpha_lasers"
    assert "Alpha Lasers" in results_for_a[0].snippet

def test_customer_isolation_within_org():
    """
    Verify that Customer A cannot retrieve Customer B's order tracking data.
    """
    store = VectorStore()

    order_cust_1 = VectorRecord(
        id="order_c1",
        org_id="org_main_factory",
        customer_id="cust_nexasolar",
        source_id="PO-101",
        source_title="NexaSolar Order PO-101",
        source_type="order",
        content="NexaSolar 500 units brackets delivered to Bangalore facility.",
        embedding=embedding_service.get_embedding("NexaSolar order delivery status"),
        metadata={}
    )

    order_cust_2 = VectorRecord(
        id="order_c2",
        org_id="org_main_factory",
        customer_id="cust_aerospace",
        source_id="PO-202",
        source_title="Aerospace Defense PO-202",
        source_type="order",
        content="Titanium rocket flange for defense aerospace project.",
        embedding=embedding_service.get_embedding("Aerospace rocket flange defense order"),
        metadata={}
    )

    store.add_records([order_cust_1, order_cust_2])

    query_emb = embedding_service.get_embedding("order status")
    
    # Customer 1 queries
    res_cust_1 = store.search(
        query_embedding=query_emb,
        org_id="org_main_factory",
        customer_id="cust_nexasolar"
    )

    for r in res_cust_1:
        assert "Aerospace" not in r.snippet
        assert "rocket flange" not in r.snippet
