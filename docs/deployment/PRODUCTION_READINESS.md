# Production Readiness & Deployment Checklist (SIH26097)
**Platform**: PM-AJAY Livelihood Intelligence Platform (LIP)  
**Date**: 30 September 2026  
**Auditor**: Senior DevOps & Cloud Infrastructure Architect  

---

## 1. Production Architecture Checklist

| Production Criterion | Specification & Implementation | Status |
|---|---|---|
| **Multi-Stage Container Builds** | `backend/Dockerfile` and `apps/web/Dockerfile` use multi-stage builds. Production web image uses Node.js 20 Alpine with standalone output; backend uses Python 3.11 Slim with non-root execution. | READY |
| **Database Migrations** | Schema updates managed strictly via Alembic (`alembic/versions/2ef374a0880a_initial_schema_v3.py`). Production startup does NOT rely on ad-hoc `create_all()`. | READY |
| **PostgreSQL Driver** | Configured with `psycopg[binary]` supporting connection pooling (`pool_size=10`, `max_overflow=20`) and proper query timeouts. | READY |
| **Health Probes** | Independent liveness probe (`GET /health/live`) and readiness probe (`GET /health/ready` verifying DB connectivity) integrated for container orchestrators. | READY |
| **Zero Stack Trace Leaks** | Unhandled server exceptions wrapped in structured JSON error payloads. Internal Python exception traces are never exposed in responses. | READY |
| **CORS Origins** | Wildcard `*` origins disabled in production mode. Restricted to configured frontend hostnames (`ALLOWED_ORIGINS`). | READY |
| **JWT Secrets & Key Rotation** | `SECRET_KEY` validated on startup (minimum 32 characters). Cryptographically signed using HMAC-SHA256. | READY |
| **PWA Service Worker** | Static assets and offline core pages pre-cached via `/sw.js` with background synchronization queues. | READY |

---

## 2. Production Environment Configuration

```bash
# Core Environment Variables
ENVIRONMENT=production
SECRET_KEY=production-secure-random-32-byte-hex-string
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=["https://lip.gov.in","https://app.lip.gov.in"]

# Database Connection
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
