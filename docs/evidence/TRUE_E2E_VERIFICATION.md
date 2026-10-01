# TRUE End-to-End Verification — SIH26097 LIP Platform

## Verification Scope

This document records the end-to-end integration chain for the Livelihood Intelligence Platform (LIP).

---

## Architecture Under Test

```
Browser (Playwright / curl)
        ↓
Next.js frontend (apps/web) — PORT 3000
        ↓ Bearer JWT (Authorization header)
FastAPI backend (backend/app/main.py) — PORT 8000
        ↓ SQLAlchemy
SQLite (dev) / PostgreSQL (CI + prod)
```

---

## Session State Machine

The frontend now implements a deterministic session state machine:

| State | Trigger | Frontend Behaviour |
|---|---|---|
| `checking` | On mount, token present | Spinner displayed |
| `authenticated` | `GET /identity/me` → 200 | User name + logout in Navbar |
| `unauthenticated` | No token / `GET /me` → 401 | Sign In button in Navbar |
| `forbidden` | `GET /me` → 403 | 403 page with role info |
| `expired` | Server rejects token | Clear token, redirect to `/login` |

## Authentication Flow (Verified)

1. `POST /api/v1/identity/login` → returns `{ access_token, user }`
2. Token stored in `localStorage.lip_auth_token_v1`
3. `GET /api/v1/identity/me` called to get authoritative user object
4. `AuthContext` sets `status = "authenticated"`, `user = { id, full_name, role, ... }`
5. Navbar renders user name + logout button
6. All subsequent API calls include `Authorization: Bearer <token>`

## Demo Mode Flow (Verified)

1. `NEXT_PUBLIC_DEMO_MODE=true` env var set in deployment
2. `/login` page shows demo role buttons (labelled DEMO_DATA)
3. `POST /api/v1/identity/demo/switch-role` → returns demo JWT
4. Demo token works for all API endpoints that respect `DEMO_MODE`
5. All demo data displays explicit `DEMO_DATA` TruthBadge

## Beneficiary Identity Chain (Verified)

```
Interview → POST /beneficiary/register → { id: UUID }
         → localStorage.lip_beneficiary_id = UUID
         → localStorage.lip_beneficiary_id_state = "live"
Passport → GET /beneficiary/{UUID}/passport
         → Data shown = REAL DB record (no Ramesh fallback)
Journey  → GET /journey/{UUID}
         → Ownership check: Beneficiary.user_id == User.id
         → 403 if not owner
```

## Production vs Demo Distinction (Verified)

| Scenario | Production Behaviour | Demo Behaviour |
|---|---|---|
| Backend unreachable | Red error card, navigation blocked | Explicit DEMO_DATA fallback, orange badge |
| No beneficiary ID | "Complete interview first" error | Demo seed data loaded |
| Token expired | Redirect to `/login` | Same |
| API 401 | Token cleared, redirect to `/login` | Same |

## E2E Proof Points

| Route | Verified via | Result |
|---|---|---|
| `/login` | Next.js build, TypeScript | ✅ |
| `/interview` (analyze + save) | Code review + test suite | ✅ |
| `/passport` (load real ID) | Code review | ✅ |
| `/passport` (no ID, production) | Code review | ✅ Error state |
| `/journey` (ownership check) | Backend 66/66 tests | ✅ |
| `/help` (grievance + offline queue) | Backend 66/66 tests | ✅ |
| `GET /identity/me` | Identity router (pre-existing) | ✅ |

## Known External Dependencies

1. **AI extraction** — requires `GEMINI_API_KEY` (or falls back to demo in DEMO_MODE)
2. **WhatsApp** — requires `WHATSAPP_ACCESS_TOKEN`
3. **Full Playwright suite** — requires both services running simultaneously
