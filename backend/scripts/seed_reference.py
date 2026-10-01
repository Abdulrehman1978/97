#!/usr/bin/env python3
"""
Seed Reference Data Only.
Safe for production deployments: seeds only authoritative taxonomies, NCO-2015,
NQR standards, and PM-AJAY funding rules. No synthetic personas or passwords.
"""

import sys
import os
sys.path.insert(0, os.path.abspath("."))

from backend.app.database import SessionLocal
from backend.app.seed import seed_reference_data

def main():
    print("[SCRIPT] Seeding Official Reference Data (Taxonomies, Qualifications, Rules)...")
    db = SessionLocal()
    try:
        seed_reference_data(db)
        print("[SCRIPT] Reference seeding complete.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
