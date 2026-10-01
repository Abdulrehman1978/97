from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.seed import seed_database

# Import routers from all 8 core domain modules
from backend.app.identity.router import router as identity_router
from backend.app.beneficiary.router import router as beneficiary_router
from backend.app.knowledge.router import router as knowledge_router
from backend.app.intelligence.router import router as intelligence_router
from backend.app.opportunities.router import router as opportunities_router
from backend.app.journey.router import router as journey_router
from backend.app.integrations.router import router as integrations_router
from backend.app.admin.router import router as admin_router

from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import status, HTTPException, Depends
from backend.app.database import get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan handler: in demo mode ensures seed data exists without create_all."""
    if settings.DEMO_MODE:
        try:
            seed_database(include_demo=True)
        except Exception as e:
            print(f"[STARTUP] Seed notice: {e}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-Grade AI-Driven Voice Operating System for PM-AJAY GIA Livelihood Skilling.",
    lifespan=lifespan
)

# CORS middleware: Strict origin allowlist without wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount 8 core domain modules under /api/v1
app.include_router(identity_router, prefix="/api/v1")
app.include_router(beneficiary_router, prefix="/api/v1")
app.include_router(knowledge_router, prefix="/api/v1")
app.include_router(intelligence_router, prefix="/api/v1")
app.include_router(opportunities_router, prefix="/api/v1")
app.include_router(journey_router, prefix="/api/v1")
app.include_router(integrations_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/health/live")
def health_live():
    """Liveness probe: verifies process is running."""
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

@app.get("/health/ready")
def health_ready(db: Session = Depends(get_db)):
    """Readiness probe: verifies database connectivity with SELECT 1."""
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database readiness probe failed: {str(e)}"
        )
    return {
        "status": "ready",
        "database": "ok",
        "demo_mode": settings.DEMO_MODE,
        "truth_state": "LIVE" if not settings.DEMO_MODE else "DEMO_DATA",
        "architecture": "FastAPI Modular Monolith (8 Modules)"
    }

@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "health_url": "/health/ready"
    }
