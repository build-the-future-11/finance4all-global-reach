#!/usr/bin/env python3
"""Validate Finance4All public-claim records before release.

The validator enforces claim-to-evidence plumbing. It does not judge whether the
evidence is scientifically correct, whether a reviewer is independent, or
whether a claim is legally permissible in every jurisdiction.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

VERSION = "1.0.0"
STATUSES = {"DRAFT", "ALLOWED", "WITHDRAWN", "CORRECTED"}
PROJECT_RE = re.compile(r"^F4A-(0[1-9]|[1-3][0-9]|4[0-8])$")
HASH_RE = re.compile(r"^[0-9a-f]{40,64}$")
PLACEHOLDERS = {"", "unknown", "tbd", "none", "unassigned"}


def timestamp(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return dt.tzinfo is not None and dt.utcoffset() is not None


def substantive(value: Any, minimum: int = 3) -> bool:
    return (
        isinstance(value, str)
        and len(value.strip()) >= minimum
        and value.strip().lower() not in PLACEHOLDERS
    )


def validate(registry: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    claims = registry.get("claims")
    if type(registry.get("version")) is not int or registry.get("version") != 1:
        errors.append("registry version must be integer 1")
    if not isinstance(claims, list):
        claims = []
        errors.append("claims must be an array")

    seen: set[str] = set()
    allowed = 0

    for index, claim in enumerate(claims, 1):
        prefix = f"claims[{index}]"
        if not isinstance(claim, dict):
            errors.append(f"{prefix} must be an object")
            continue

        claim_id = claim.get("claim_id")
        if not substantive(claim_id):
            errors.append(f"{prefix}: substantive claim_id required")
            claim_id = prefix
        elif claim_id in seen:
            errors.append(f"{prefix}: duplicate claim_id {claim_id}")
        seen.add(str(claim_id))

        project_id = claim.get("project_id")
        if not isinstance(project_id, str) or not PROJECT_RE.fullmatch(project_id):
            errors.append(f"{claim_id}: project_id must be F4A-01..F4A-48")

        if not substantive(claim.get("claim_text"), 10):
            errors.append(f"{claim_id}: claim_text must be substantive")

        status = claim.get("status")
        if status not in STATUSES:
            errors.append(f"{claim_id}: invalid status")
            continue

        evidence_refs = claim.get("evidence_refs")
        if not isinstance(evidence_refs, list) or any(not substantive(x, 3) for x in evidence_refs):
            errors.append(f"{claim_id}: evidence_refs must be an array of substantive references")
            evidence_refs = []

        if status == "DRAFT":
            if substantive(claim.get("public_wording"), 3):
                errors.append(f"{claim_id}: DRAFT must not contain releasable public_wording")
            continue

        if status == "ALLOWED":
            allowed += 1
            if not substantive(claim.get("protocol_id"), 5):
                errors.append(f"{claim_id}: ALLOWED requires protocol_id")
            if not evidence_refs:
                errors.append(f"{claim_id}: ALLOWED requires at least one evidence reference")
            if not substantive(claim.get("reviewer"), 3):
                errors.append(f"{claim_id}: ALLOWED requires named reviewer")
            if not timestamp(claim.get("reviewed_at")):
                errors.append(f"{claim_id}: ALLOWED requires timezone-aware reviewed_at")
            if not substantive(claim.get("public_wording"), 10):
                errors.append(f"{claim_id}: ALLOWED requires bounded public_wording")
            commit = claim.get("evidence_commit")
            if commit is not None and (not isinstance(commit, str) or not HASH_RE.fullmatch(commit)):
                errors.append(f"{claim_id}: evidence_commit must be a 40–64 char lowercase hex digest when supplied")

        if status in {"WITHDRAWN", "CORRECTED"}:
            if not substantive(claim.get("correction_note"), 10):
                errors.append(f"{claim_id}: {status} requires correction_note")
            if not timestamp(claim.get("reviewed_at")):
                errors.append(f"{claim_id}: {status} requires timezone-aware reviewed_at")

    return {
        "validator_version": VERSION,
        "status": "PASS" if not errors else "FAIL",
        "claim_count": len(claims),
        "allowed_count": allowed,
        "errors": errors,
        "scope": "Claim/evidence linkage only; scientific validity and reviewer independence remain separate review gates.",
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("registry", type=Path)
    args = parser.parse_args(argv)
    try:
        value = json.loads(args.registry.read_text(encoding="utf-8"))
        if not isinstance(value, dict):
            raise ValueError("registry root must be an object")
        result = validate(value)
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "ERROR", "error": str(exc)}), file=sys.stderr)
        return 2

    print(json.dumps(result, indent=2, allow_nan=False))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
