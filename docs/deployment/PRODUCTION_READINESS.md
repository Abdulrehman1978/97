# Production Readiness & Deployment Checklist (SIH26097)
**Platform**: PM-AJAY Livelihood Intelligence Platform (LIP)  
**Date**: 01 October 2026  
**Auditor**: Senior DevOps & Cloud Infrastructure Architect  
**Packet**: Packet 28.1 — Clean-Clone Reproducibility & Security Closure  

---

## 1. Production Architecture Checklist

| Production Criterion | Specification & Implementation | Status |
|---|---|---|
| **Multi-Stage Container Builds** | `backend/Dockerfile` and `apps/web/Dockerfile` use multi-stage builds. Production web image uses Node.js 22 Alpine with standalone output; backend uses Python 3.12 Slim running under non-root `appuser`. | READY |
| **Migration-First Startup** | Containers execute `backend/docker-entrypoint.sh` running `alembic upgrade head` before launching `uvicorn`. Production code does NOT execute `Base.metadata.create_all()`. | READY |
| **Clean Initial Migration** | Complete 39-table initial schema in `alembic/versions/8f7083d5f517_initial_schema_v3.py`. Verified on empty PostgreSQL. | READY |
| **PostgreSQL Driver** | Configured with `psycopg[binary]` supporting connection pooling (`pool_size=10`, `max_overflow=20`) and proper query timeouts. | READY |
| **Health Probes** | Independent liveness probe (`GET /health/live`) and true readiness probe (`GET /health/ready` executing `SELECT 1` against PostgreSQL) returning 503 if database is disconnected. | READY |
| **Zero Stack Trace Leaks** | Unhandled server exceptions wrapped in structured JSON error payloads. Internal Python exception traces are never exposed in responses. | READY |
| **CORS Origins** | Wildcard `*` origins disabled in production mode. Restricted to configured frontend hostnames (`ALLOWED_ORIGINS`). | READY |
| **JWT Secrets & Key Rotation** | `SECRET_KEY` validated on startup (minimum 32 characters). Cryptographically signed using HMAC-SHA256. | READY |
| **Demo Isolation** | In production mode (`DEMO_MODE=false`), `/api/v1/identity/demo/switch-role` returns HTTP 404, and demo seed scripts are completely disabled. | READY |
| **PWA Service Worker** | Static assets and offline core pages pre-cached via `/sw.js` with background synchronization queues. | READY |

---

## 2. Production Environment Configuration

```bash
# Core Environment Variables
ENVIRONMENT=production
DEMO_MODE=false
SECRET_KEY=production-secure-random-32-byte-hex-string
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=["https://lip.gov.in","https://app.lip.gov.in"]

# Database Connection (PostgreSQL 16)
DATABASE_URL=postgresql://lip_prod_user:SecureProdPass@postgres-cluster.internal:5432/lip_production_db

# Storage Abstraction (S3 / MinIO)
STORAGE_BACKEND=s3
S3_ENDPOINT_URL=https://s3.ap-south-1.amazonaws.com
S3_BUCKET_NAME=lip-evidence-storage
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...

# External Telephony & Speech Adapters (When transitioning from SANDBOX to LIVE)
BHASHINI_API_KEY=...
SARVAM_API_KEY=...
EXOTEL_ACCOUNT_SID=...
EXOTEL_API_TOKEN=...
```
