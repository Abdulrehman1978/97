#!/usr/bin/env python3
"""
Seed Demo Operational Data.
Only executes when DEMO_MODE is True. Populates demo organizations,
training batches, and demo candidate personas for SIH judge evaluation.
"""

import sys
import os
sys.path.insert(0, os.path.abspath("."))

from backend.app.config import settings
from backend.app.database import SessionLocal
from backend.app.seed import seed_reference_data, seed_demo_data

def main():
    if not settings.DEMO_MODE:
        print("[ERROR] Cannot seed demo data: DEMO_MODE is set to False.")
        print("To enable demo seeding, set DEMO_MODE=true in your environment or .env file.")
        sys.exit(1)

    print("[SCRIPT] Seeding SIH Judge Demo Personas and Operational Batches...")
    db = SessionLocal()
    try:
        seed_reference_data(db)
        seed_demo_data(db)
        print("[SCRIPT] Demo seeding complete.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
