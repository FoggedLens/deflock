#!/usr/bin/env python3
"""
migrate_recent_wins.py — One-time migration from RecentWins to flockWins.

Usage:
    uv run python migrate_recent_wins.py

Requires DIRECTUS_API_KEY in .env.
"""

import json
import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

CMS_BASE = "https://cms.deflock.me/items"


def main():
    api_key = os.environ.get("DIRECTUS_API_KEY")
    if not api_key:
        print("Error: DIRECTUS_API_KEY is not set in the environment or .env file.")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    print("Fetching RecentWins...")
    resp = requests.get(f"{CMS_BASE}/RecentWins", timeout=15)
    resp.raise_for_status()
    instances = resp.json()["data"]["WinInstances"]
    print(f"Found {len(instances)} entries.\n")

    ok, failed = 0, 0
    for item in instances:
        payload = {
            "cityState": item["cityState"],
            "monthYear": item["MonthYear"],
            "description": item["description"],
            "outcome": item["Outcome"],
        }
        print(f"  Importing: {payload['cityState']} ({payload['monthYear']})...")
        try:
            r = requests.post(f"{CMS_BASE}/flockWins", json=payload, headers=headers, timeout=15)
            r.raise_for_status()
            new_id = r.json().get("data", {}).get("id")
            print(f"    ✓ Created id={new_id}")
            ok += 1
        except requests.exceptions.RequestException as e:
            print(f"    ✗ Failed: {e}")
            failed += 1

    print(f"\nDone. {ok} imported, {failed} failed.")


if __name__ == "__main__":
    main()
