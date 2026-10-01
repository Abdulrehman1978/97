#!/usr/bin/env python3
"""
Development Environment Bootstrap Script.
Convenience tool for local developer setup: initializes database tables and seeds reference + demo data.
NOT for production use.
"""

import sys
import os
sys.path.insert(0, os.path.abspath("."))

from backend.app.database import init_db
from backend.app.seed import seed_database

def main():
    print("[BOOTSTRAP] Initializing database tables for development...")
    init_db()
    print("[BOOTSTRAP] Seeding reference and demo data...")
    seed_database(include_demo=True)
    print("[BOOTSTRAP] Development database ready.")

if __name__ == "__main__":
    main()
