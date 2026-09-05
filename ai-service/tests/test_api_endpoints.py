import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "provider" in data

def test_chat_completions_endpoint():
    headers = {
        "X-Org-ID": "org-forge-default",
        "X-Service-Key": "forgeiq_internal_service_key_2026",
    }
    payload = {
        "query": "What is our current machine capacity for laser cutting?"
    }
    response = client.post("/api/v1/chat/completions", json=payload, headers=headers)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "data" in res_data
    assert len(res_data["data"]["supporting_evidence"]) > 0

def test_rfq_intake_endpoint():
    headers = {
        "X-Org-ID": "org-forge-default",
        "X-Service-Key": "forgeiq_internal_service_key_2026",
    }
    payload = {
        "raw_text": "Customer needs 200 laser cut mounting flanges in 6061 Aluminum, 4mm thick by next week"
    }
    response = client.post("/api/v1/rfq/intake", json=payload, headers=headers)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["quantity"] >= 1
    assert "Aluminum" in res_data["data"]["material"] or "Stainless" in res_data["data"]["material"]

def test_document_ingestion_and_rag_search():
    headers = {
        "X-Org-ID": "org-test-special",
        "X-Service-Key": "forgeiq_internal_service_key_2026",
    }
    
    # 1. Ingest
    ingest_payload = {
        "document_title": "Titanium Machining Best Practices",
        "document_type": "technical_spec",
        "content_text": "Titanium Grade 5 requires carbide inserts with high pressure coolant to maintain dimensional tolerance under 0.02 mm."
    }
    ingest_resp = client.post("/api/v1/documents/ingest", json=ingest_payload, headers=headers)
    assert ingest_resp.status_code == 200
    assert ingest_resp.json()["data"]["chunks_created"] >= 1

    # 2. Search
    search_resp = client.get("/api/v1/rag/search?q=Titanium+dimensional+tolerance", headers=headers)
    assert search_resp.status_code == 200
    citations = search_resp.json()["data"]
    assert len(citations) >= 1
    assert citations[0]["org_id"] == "org-test-special"
    assert "Titanium" in citations[0]["snippet"]
