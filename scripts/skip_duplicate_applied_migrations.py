#!/usr/bin/env python3
"""Exclude exact SQL duplicates of already-applied migrations during CI.

Branch merges can bring an original migration under an older filename after
the same SQL was applied under a different Supabase version. Keep both source
files in Git, but never replay identical SQL via --include-all. This modifies
only the ephemeral runner checkout, not Git history or Supabase records.
"""
import hashlib
from pathlib import Path
import re
import shutil
import subprocess
import sys

PATTERN=re.compile(r"^(\d{14})_[^/]+\.sql$")

def main():
    p=subprocess.run(["supabase","migration","list","--linked"],capture_output=True,text=True)
    if p.returncode:
        raise RuntimeError(p.stderr)
    remote=set()
    for line in (p.stdout+"\n"+p.stderr).splitlines():
        fields=[x.strip() for x in line.strip().strip("|").split("|")]
        if len(fields)>=2 and re.fullmatch(r"\d{14}",fields[1]):
            remote.add(fields[1])
    if not remote:
        raise RuntimeError("Unable to parse remote migration versions; refusing to deploy")
    files={}
    for path in Path("supabase/migrations").glob("*.sql"):
        match=PATTERN.fullmatch(path.name)
        if match:
            files[path]=match.group(1)
    missing=remote-set(files.values())
    if missing:
        raise RuntimeError(f"Applied migrations missing original SQL in this checkout: {sorted(missing)}")
    applied_hashes={hashlib.sha256(path.read_bytes()).hexdigest() for path,version in files.items() if version in remote}
    excluded=Path("/tmp/sat-ci-duplicate-migrations")
    for path,version in files.items():
        if version in remote:
            continue
        if hashlib.sha256(path.read_bytes()).hexdigest() in applied_hashes:
            excluded.mkdir(exist_ok=True)
            shutil.move(str(path),str(excluded/path.name))
            print(f"Excluded already-applied SQL duplicate from CI push: {path.name}")
    print("Migration SQL deduplication complete. Remote history unchanged.")

if __name__=="__main__":
    try:main()
    except Exception as error:
        print(str(error),file=sys.stderr)
        sys.exit(1)
