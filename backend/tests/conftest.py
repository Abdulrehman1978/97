import os
import pytest
from backend.app.database import engine, init_db, SessionLocal
from backend.app.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Initialize all tables and official seed data before test session."""
    init_db()
    try:
        seed_database()
    except Exception:
        pass
    yield
