from datetime import datetime
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.config import settings

# Engine setup with dialect-specific options
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 30}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True
)

if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=30000")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """FastAPI database dependency providing a transactional session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Import all domain models and create all tables in the configured database."""
    import backend.app.identity.models  # noqa
    import backend.app.beneficiary.models  # noqa
    import backend.app.knowledge.models  # noqa
    import backend.app.opportunities.models  # noqa
    import backend.app.journey.models  # noqa
    import backend.app.admin.models  # noqa
    Base.metadata.create_all(bind=engine)

