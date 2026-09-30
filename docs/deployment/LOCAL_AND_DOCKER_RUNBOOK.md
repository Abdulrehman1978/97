# Local & Docker Runbook (SIH26097)
**Platform**: PM-AJAY Livelihood Intelligence Platform (LIP)  
**Target Environment**: Local Developer Workstation, Testing VM, or Docker Engine  
**Last Verified**: 30 September 2026  

---

## 1. Quick Start: Docker Compose (Zero Configuration)

To run the complete production-grade stack (PostgreSQL + FastAPI Backend + Next.js Frontend) from a fresh clone:

```powershell
# 1. Clone repository
git clone https://github.com/Abdulrehman1978/97.git
cd 97

# 2. Start all services via Docker Compose
docker compose up --build -d

# 3. Verify container health
docker compose ps
```

### Verified Service Ports
- **Frontend PWA**: `http://localhost:3000`
- **Backend API & Swagger**: `http://localhost:8000/docs`
- **Health Live Endpoint**: `http://localhost:8000/health/live`
- **Health Ready Endpoint**: `http://localhost:8000/health/ready`
- **PostgreSQL Database**: `localhost:5432`

---

## 2. Bare-Metal Developer Setup (Windows / Linux / macOS)

### Prerequisites
- Python 3.11+ (Python 3.11 or 3.14 verified)
- Node.js 20+ (with npm)
- Git

### Backend Setup
```powershell
# Navigate to repository root
cd C:\97

# Create and activate Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # On Linux/macOS: source .venv/bin/activate

# Install backend dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install pytest pytest-asyncio httpx

# Run Alembic migrations (creates PostgreSQL / SQLite schema)
alembic upgrade head

# Seed initial official taxonomies and authenticated users
python -m backend.app.seed

# Start FastAPI development server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```powershell
# Open a second terminal and navigate to apps/web
cd C:\97\apps\web

# Install npm dependencies
npm ci

# Run development server
npm run dev
# Or build and run production server:
npm run build
npm start
```

---

## 3. Seeded Authenticated Test Accounts

| Role | Username / Email | Password | Primary Purpose |
|---|---|---|---|
| **District Admin** | `admin@nagpur.gov.in` | `admin123` | District demand dashboard, batch proposals, audit logs |
| **Field Mobilizer** | `worker@nagpur.gov.in` | `worker123` | Door-to-door caseload, survey validation |
| **Livelihood Counsellor** | `counsellor@nagpur.gov.in` | `counsel123` | Candidate review, pathway overrides with audit trail |
| **Financial Counsellor** | `finance@nagpur.gov.in` | `finance123` | Enterprise capex/opex pre-screening, GIA subsidies |
| **Training Provider (PIA)**| `provider@pmkk.gov.in` | `provider123` | Batch capacity creation, enrollment verification |
| **Employer** | `employer@mahavitaran.com` | `employer123` | Job postings, candidate shortlisting (caste-redacted) |
| **Beneficiary** | `ramesh@beneficiary.lip` | `ramesh123` | Voice interview, skill passport, living pathways, journey |

---

## 4. Running the Automated Test Suite

```powershell
# Run backend pytest suite (46 automated tests)
pytest -v

# Run frontend production build & TypeScript typecheck
cd apps/web
npm run build
```
