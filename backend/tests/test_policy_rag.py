from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_policy_rag_grounded_answer_with_citations():
    """Validates that PM-AJAY GIA query returns grounded text and official citation."""
    response = client.post("/api/v1/intelligence/policy-rag", json={"query": "What is the income eligibility and grant subsidy under PM-AJAY GIA?"})
    assert response.status_code == 200
    data = response.json()
    assert data["abstained"] is False
    assert "2.50 Lakh" in data["answer"]
    assert "50,000" in data["answer"]
    assert len(data["citations"]) > 0

def test_policy_rag_abstains_on_unknown_query():
    """Validates that RAG engine safely abstains instead of hallucinating on unknown topics."""
    response = client.post("/api/v1/intelligence/policy-rag", json={"query": "What is the quota for submarine captains in Antarctica?"})
    assert response.status_code == 200
    data = response.json()
    assert data["abstained"] is True
    assert "could not be verified" in data["answer"]
