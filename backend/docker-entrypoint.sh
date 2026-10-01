#!/bin/sh
set -e

echo "[LIP BACKEND] Applying database migrations via Alembic..."
alembic upgrade head

if [ "$DEMO_MODE" = "true" ]; then
    echo "[LIP BACKEND] DEMO_MODE=true: running demo fixtures..."
    python -m backend.scripts.seed_demo || true
else
    echo "[LIP BACKEND] Production mode: seeding official reference data..."
    python -m backend.scripts.seed_reference || true
fi

echo "[LIP BACKEND] Starting FastAPI uvicorn server..."
exec uvicorn backend.app.main:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8000}"
