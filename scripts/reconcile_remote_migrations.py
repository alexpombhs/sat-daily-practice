#!/usr/bin/env python3
"""Make remote-applied migrations visible to Supabase CLI on this CI checkout.

Out-of-order PR merges may leave schema_migrations versions applied remotely
whose original SQL files are not on main yet. Never repair/revert remote history:
create empty, temporary local counterparts ONLY for remote-applied versions.
They are not committed, executed or used as a baseline for a new database.
"""
from pathlib import Path
import re
import subprocess
import sys

VERSION = re.compile(r"^\d{8,14}$")
FILE_VERSION = re.compile(r"^(\d{8,14})_.+\.sql$")

def main() -> int:
    result = subprocess.run(
        ["supabase", "migration", "list", "--linked"],
        text=True, capture_output=True, check=False,
    )
    if result.returncode:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        return result.returncode

    output = re.sub(r"\x1b\[[0-9;]*m", "", result.stdout + "\n" + result.stderr)
    header_seen = False
    rows = []
    for line in output.splitlines():
        if "|" not in line:
            continue
        fields = [field.strip() for field in line.strip().strip("|").split("|")]
        if len(fields) < 2:
            continue
        if fields[0].lower() == "local" and fields[1].lower() == "remote":
            header_seen = True
            continue
        local, remote = fields[:2]
        if VERSION.fullmatch(local) or VERSION.fullmatch(remote):
            rows.append((local, remote))

    if not header_seen or not rows:
        print("Cannot safely parse Supabase migration history; refusing to push.", file=sys.stderr)
        print(output, file=sys.stderr)
        return 1

    migrations = Path("supabase/migrations")
    migrations.mkdir(parents=True, exist_ok=True)
    existing = {
        match.group(1)
        for path in migrations.glob("*.sql")
        if (match := FILE_VERSION.fullmatch(path.name))
    }
    placeholders = []
    for local, remote in rows:
        if not VERSION.fullmatch(remote) or remote in existing:
            continue
        path = migrations / f"{remote}_remote_applied_ci_only.sql"
        if path.exists():
            continue
        path.write_text(
            "-- CI-only placeholder for migration already applied to the linked database.\n"
            "-- Original SQL belongs to a PR not yet merged on this branch.\n"
            "-- Never commit this file or use it to bootstrap a new database.\n",
            encoding="utf-8",
        )
        existing.add(remote)
        placeholders.append(remote)

    print(f"Remote-applied versions temporarily reconciled: {len(placeholders)}")
    if placeholders:
        print("Remote history is NOT modified. Applied SQL will NOT be replayed.")
        print("Versions:", ", ".join(placeholders))
    return 0

if __name__ == "__main__":
    sys.exit(main())
