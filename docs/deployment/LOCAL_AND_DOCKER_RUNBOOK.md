# Local & Docker Runbook (SIH26097)
**Platform**: PM-AJAY Livelihood Intelligence Platform (LIP)  
**Target Environment**: Local Developer Workstation, Testing VM, or Docker Engine  
**Last Verified**: 01 October 2026  
**Toolchain**: Python 3.12 (or 3.14 local), Node.js 22, PostgreSQL 16  

---

## 1. Quick Start: Docker Compose

### Production Profile (Default)
Executes migration-first entrypoint, strictly disables demo role switcher, requires environment secrets:
```powershell
# 1. Clone repository
git clone https://github.com/Abdulrehman1978/97.git
cd 97

# 2. Start production containers
docker compose up --build -d

# 3. Verify container health
docker compose ps
```

### SIH Judge / Evaluation Demo Profile
Enables interactive evaluator role switching, seeds Ramesh Mesram demo persona, Nagpur pilot demand, and mock telephony:
```powershell
docker compose -f docker-compose.yml -f docker-compose.demo.yml up --build -d
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
- Python 3.12+ (Python 3.12 or 3.14 verified)
- Node.js 22+ (with npm)
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

# Run Alembic migrations (creates complete 39-table schema on clean DB)
alembic upgrade head

# Seed official reference taxonomies (NCO, NSQF, PM-AJAY rules)
python -m backend.scripts.seed_reference

# (Optional: for local demo/testing only) Seed demo personas & vacancies
python -m backend.scripts.seed_demo

# Start FastAPI development server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```powershell
cd C:\97\apps\web

# Clean deterministic install using committed lockfile
npm ci

# Typecheck and linting
npm run lint
npm run typecheck

# Production build
npm run build

# Start production server
npm run start
```

### Test Suite Execution
```powershell
# Run backend pytest suite (58 tests)
cd C:\97
.\.venv\Scripts\pytest -v

# Run Playwright E2E and axe-core accessibility suite (14 tests)
cd C:\97\apps\web
npx playwright test
```
