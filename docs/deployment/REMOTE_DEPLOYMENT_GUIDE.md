# Remote Production Deployment Guide (SIH26097)
**Platform**: PM-AJAY Livelihood Intelligence Platform (LIP)  
**Architecture**: FastAPI Modular Monolith (Backend) + Next.js PWA (Frontend) + Managed PostgreSQL 16 (Database)  
**Date**: October 2026  

---

## 1. Production Architecture Overview

The Livelihood Intelligence Platform is architected for clean separation of concerns:
```text
┌──────────────────────────┐         ┌───────────────────────────┐
│ Next.js 16 PWA Frontend  │ ──────> │ FastAPI Modular Monolith  │
│ (Hosted on Vercel / Edge)│  HTTPS  │ (Docker Container on Host)│
└──────────────────────────┘         └─────────────┬─────────────┘
                                                   │
                                                   │ SQL (psycopg)
                                                   ▼
                                     ┌───────────────────────────┐
                                     │ Managed PostgreSQL 16 DB  │
                                     │ (Neon / Supabase / RDS)   │
                                     └───────────────────────────┘
```

---

## 2. Pre-Deployment Readiness Checklist

Before triggering remote deployment, verify:
- [x] Backend tests: **66/66 passing** (`pytest -v`)
- [x] Full-Stack E2E: **28/28 Playwright passing** against live container stack
- [x] Frontend build: **17/17 static pages compiled cleanly** (`next build`)
- [x] Relational schema: **39 tables strictly managed by Alembic** (`8f7083d5f517`)
- [x] Security: Bcrypt work factor 12, PII caste redaction for employers, RBAC route guards
- [x] Environment variable flexibility: Comma-separated and JSON list CORS origins parsed automatically

---

## 3. Database Setup (Managed PostgreSQL 16)

1. Provision a PostgreSQL 16 instance on your preferred cloud provider (e.g. AWS RDS, Neon, Supabase, Render PostgreSQL).
2. Obtain the connection string:
   ```text
   postgresql://lip_prod_user:<PASSWORD>@<HOST>:5432/<DB_NAME>?sslmode=require
   ```
   *(Note: URLs beginning with `postgres://` are automatically normalized to `postgresql://` by the LIP configuration parser).*
3. Ensure network ingress allows connections from your backend container IP/range.

---

## 4. Backend Deployment (Docker Container)

Deployable to **Render Web Service**, **Railway**, **Google Cloud Run**, **Fly.io**, or **AWS App Runner**.

### 4.1 Build Configuration
- **Repository**: `https://github.com/Abdulrehman1978/97.git`
- **Root Directory**: `.` (repository root)
- **Dockerfile Path**: `backend/Dockerfile`
- **Context**: `.`

### 4.2 Required Environment Variables
| Variable | Production Value | Description |
|---|---|---|
| `ENVIRONMENT` | `production` | Enables production security policies |
| `DATABASE_URL` | `postgresql://...` | Connection URI to managed PostgreSQL |
| `SECRET_KEY` | *(Generated 32+ char hex)* | Used for cryptographic JWT signing |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Comma-separated or JSON list of allowed origins |
| `DEMO_MODE` | `false` | Disables demo role switching and fixtures |
| `ENABLE_MOCK_SPEECH` | `true` or `false` | True for sandbox/synthetic speech; false for live provider |
| `ENABLE_MOCK_TELEPHONY` | `true` or `false` | True for sandbox IVR; false for live telephony provider |
| `PORT` | Set by cloud host (e.g., 8000, 8080, 10000) | Uvicorn automatically binds to `${PORT:-8000}` |

### 4.3 Container Startup Sequence
When the container boots, `backend/docker-entrypoint.sh` automatically:
1. Runs `alembic upgrade head` to apply all 39 database tables.
2. In production (`DEMO_MODE=false`), executes `python -m backend.scripts.seed_reference` to seed official NCO, NSQF, and PM-AJAY taxonomies.
3. Launches Uvicorn listening on `0.0.0.0:${PORT:-8000}`.

### 4.4 Health Probes
- **Liveness**: `GET /health/live` (HTTP 200 `{"status":"ok", ...}`)
- **Readiness**: `GET /health/ready` (Verifies database with `SELECT 1`, returns HTTP 200 or 503)

---

## 5. Frontend Deployment (Vercel)

Deployable directly via Vercel GitHub Integration or Vercel CLI.

### 5.1 Project Configuration
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `next build`
- **Output Directory**: Next.js default (`.next`)
- **Install Command**: `npm ci`

### 5.2 Required Environment Variables
| Variable | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api.onrender.com` | Public URL of deployed FastAPI backend |

### 5.3 Post-Deployment DNS & CORS Verification
Once Vercel assigns the domain (e.g. `https://lip-web.vercel.app` or custom domain `https://lip.gov.in`):
1. Add the domain to the backend's `ALLOWED_ORIGINS` environment variable.
2. Trigger a rolling restart of the backend service.

---

## 6. Post-Deployment Verification (Smoke Checks)

Execute the following commands against the deployed URLs:

```powershell
# 1. Verify Backend Liveness Probe
curl.exe -i https://your-backend-api.com/health/live

# Expected Response:
# HTTP/1.1 200 OK
# {"status":"ok","app":"Livelihood Intelligence Platform","version":"3.0.0"}

# 2. Verify Database Readiness Probe
curl.exe -i https://your-backend-api.com/health/ready

# Expected Response:
# HTTP/1.1 200 OK
# {"status":"ready","database":"ok","demo_mode":false,"truth_state":"LIVE",...}

# 3. Verify Production Demo Route Guard (Must return 404)
curl.exe -i -X POST https://your-backend-api.com/api/v1/identity/demo/switch-role

# Expected Response:
# HTTP/1.1 404 Not Found

# 4. Verify Frontend Accessibility
curl.exe -I https://your-frontend.vercel.app

# Expected Response:
# HTTP/1.1 200 OK
# x-powered-by: Next.js
```
