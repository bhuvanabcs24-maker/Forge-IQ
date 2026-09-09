import pytest
from datetime import datetime, timedelta
from app.rag.knowledge_loader import (
    KnowledgeConflictResolver,
    factory_knowledge_service,
)
from app.models.schemas import MachineRecord, MaterialRecord

def test_source_priority_hierarchy():
    """
    Verify Section 2 & 7: Factory Database > Supplier Data > Web > LLM memory.
    """
    competing_prices = [
        {
            "value": 235.0,
            "unit": "INR/kg",
            "source": "Supplier B Portal",
            "source_type": "supplier_data",
            "confidence": 0.90
        },
        {
            "value": 220.0,
            "unit": "INR/kg",
            "source": "General Web Metal Index",
            "source_type": "general_web",
            "confidence": 0.70
        },
        {
            "value": 228.0,
            "unit": "INR/kg",
            "source": "Factory Material Master DB",
            "source_type": "factory_database",
            "confidence": 0.98
        },
        {
            "value": 245.0,
            "unit": "INR/kg",
            "source": "LLM Parameter Memory",
            "source_type": "llm_memory",
            "confidence": 0.50
        }
    ]

    res = KnowledgeConflictResolver.resolve(competing_prices)
    assert res.resolved_value == 228.0
    assert res.unit == "INR/kg"
    assert res.chosen_source == "Factory Material Master DB"
    assert res.source_priority_rank == 1
    assert res.status == "verified"
    assert res.confidence >= 0.95

def test_staleness_detection_on_expired_records():
    """
    Verify Section 6 & 66: Expired records must be marked as stale.
    """
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    expired_quote = [
        {
            "value": 180.0,
            "unit": "INR/kg",
            "source": "Expired Factory Contract",
            "source_type": "factory_database",
            "valid_until": yesterday,
            "confidence": 0.95
        }
    ]

    res = KnowledgeConflictResolver.resolve(expired_quote)
    assert res.status == "stale"
    assert res.confidence <= 0.50

def test_factory_materials_and_machines_catalog():
    """
    Verify Section 8 & 9: Real factory materials and fleet specifications.
    """
    ss304 = factory_knowledge_service.get_material("SS304")
    assert ss304 is not None
    assert ss304.density_kg_m3 == 7930.0
    assert ss304.current_price_inr_kg == 228.0
    assert ss304.source == "FACTORY_DATABASE"
    assert ss304.verification_status == "verified"

    laser = factory_knowledge_service.get_machine("LASER-001")
    assert laser is not None
    assert laser.process == "LASER_CUTTING"
    assert laser.laser_power_kw == 6.0
    assert laser.hourly_rate_inr == 1850.0
    assert laser.status == "AVAILABLE"
