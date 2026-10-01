# Production Dockerfile for FastAPI Modular Monolith (LIP Backend)
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install minimal OS dependencies for psycopg binary and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source and database migration configurations
COPY backend /app/backend
COPY alembic /app/alembic
COPY alembic.ini /app/alembic.ini
COPY pytest.ini /app/pytest.ini
COPY backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Security: Run as unprivileged user
RUN useradd -u 1001 -m -s /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/health/live || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
