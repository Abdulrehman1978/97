# ADR-001: Lean Modular Monolith over Distributed Microservices

## Status
Accepted

## Context
Enterprise architectures frequently over-engineer public-sector pilots by deploying dozens of microservices, distributed queues (Kafka/RabbitMQ), cache clusters (Redis), and specialized vector/search databases. In the context of a government digital system serving rural beneficiaries, this introduces unnecessary failure modes, steep cloud hosting bills, difficult local replication, and fragile deployments.

## Decision
We adopt a **FastAPI Modular Monolith** coupled with **PostgreSQL** as the single authoritative operational store, complemented by Next.js as the consolidated web/PWA platform.
- The backend is partitioned cleanly into 8 domain modules (`identity`, `beneficiary`, `knowledge`, `intelligence`, `opportunities`, `journey`, `integrations`, `admin`).
- Background tasks are handled by a database-backed `background_jobs` table using transactional leases.
- Full-text search and trigram matching (`pg_trgm`) satisfy search and ontology linking without external search clusters.
- The architecture allows zero-friction local and standalone demonstration runs via SQLite fallback while maintaining full PostgreSQL DDL and production parity.

## Consequences
- Radical reduction in infrastructure complexity and cost (runs on a single container or server).
- Instant local reproducibility for SIH judges and auditors.
- Clean domain boundaries make future microservice extraction straightforward if true high-scale requirements emerge.
