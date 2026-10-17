#!/usr/bin/env python3
"""Backfill ORIGINAL applied migration SQL from GitHub branches into a main PR.

No placeholder SQL and no remote history edits. Ambiguous sources stop the sync.
Run after Supabase migrations are applied, even if the feature PR is unmerged.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import urllib.request

REPO = os.environ["GITHUB_REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
VERSION = re.compile(r"^\d{14}$")
MIGRATION = re.compile(r"^(\d{14})_[^/]+\.sql$")
API = "https://api.github.com"

def api(path):
    req=urllib.request.Request(API+path,headers={
        "Authorization":"Bearer "+TOKEN,
        "Accept":"application/vnd.github+json",
        "X-GitHub-Api-Version":"2022-11-28",
    })
    with urllib.request.urlopen(req,timeout=30) as response:
        return json.load(response)

def remote_versions():
    proc=subprocess.run(["supabase","migration","list","--linked"],capture_output=True,text=True)
    if proc.returncode:
        raise RuntimeError("Unable to read remote migration history: "+proc.stderr)
    # CLI output may use ANSI colors and either ASCII or Unicode table pipes.
    output=re.sub(r"\\x1b\\[[0-9;]*[A-Za-z]","",proc.stdout+"\\n"+proc.stderr)
    versions=set()
    header=False
    for line in output.splitlines():
        normalized=line.replace("│","|")
        cells=[cell.strip() for cell in normalized.strip().strip("|").split("|")]
        if len(cells)<2:continue
        if cells[0].lower()=="local" and cells[1].lower()=="remote":
            header=True
            continue
        if VERSION.fullmatch(cells[1]):
            versions.add(cells[1])
    if versions:
        return versions
    if header:
        # Valid empty migration history; no versions to reconcile.
        return set()
    # Include sanitized shape information for diagnosing unexpected CLI formats.
    preview=[re.sub(r"\\d{14}","<version>",x.strip())[:160]
             for x in output.splitlines() if x.strip()][:8]
    raise RuntimeError("Unrecognized Supabase migration list format: "+repr(preview))

def main():
    applied=remote_versions()
    folder=Path("supabase/migrations")
    folder.mkdir(parents=True,exist_ok=True)
    local={match.group(1) for f in folder.glob("*.sql") if (match:=MIGRATION.fullmatch(f.name))}
    missing=applied-local
    if not missing:
        print("All applied migration versions already exist on main.")
        return

    # Find actual original SQL from open/unmerged branches. Never use
    # synthetic no-op files; stop if different SQL files claim one version.
    candidates={}
    page=1
    while True:
        branches=api(f"/repos/{REPO}/branches?per_page=100&page={page}")
        if not branches:break
        for branch in branches:
            if branch["name"]=="main":continue
            tree=api(f"/repos/{REPO}/git/trees/{branch['commit']['sha']}?recursive=1")
            if tree.get("truncated"):
                raise RuntimeError("Source tree truncated for "+branch["name"])
            for entry in tree.get("tree",[]):
                path=entry.get("path","")
                if not path.startswith("supabase/migrations/") or entry.get("type")!="blob":continue
                name=path.rsplit("/",1)[-1]
                match=MIGRATION.fullmatch(name)
                if not match or match.group(1) not in missing:continue
                candidates.setdefault(match.group(1),set()).add((name,entry["sha"]))
        if len(branches)<100:break
        page+=1

    unresolved=missing-candidates.keys()
    conflicts={v:files for v,files in candidates.items() if len({sha for _,sha in files})>1}
    if unresolved or conflicts:
        raise RuntimeError(f"Applied migrations require original SQL before syncing. Missing: {sorted(unresolved)}; conflicting: {conflicts}")

    # GitHub exposes raw SQL blobs through the Git object endpoint.
    import base64
    for version,options in sorted(candidates.items()):
        name,sha=sorted(options)[0]
        blob=api(f"/repos/{REPO}/git/blobs/{sha}")
        if blob["encoding"]!="base64":
            raise RuntimeError("Unexpected Git blob encoding "+sha)
        data=base64.b64decode(blob["content"])
        (folder/name).write_bytes(data)
        print("Recovered",name,sha)
    subprocess.run(["git","add","supabase/migrations"],check=True)
    staged=subprocess.run(["git","diff","--cached","--quiet"])
    if staged.returncode==0:return
    subprocess.run(["git","config","user.name","github-actions[bot]"],check=True)
    subprocess.run(["git","config","user.email","41898282+github-actions[bot]@users.noreply.github.com"],check=True)
    subprocess.run(["git","commit","-m","chore: synchronize already-applied Supabase migrations"],check=True)

if __name__=="__main__":
    try:main()
    except Exception as error:
        print(str(error),file=sys.stderr)
        sys.exit(1)
