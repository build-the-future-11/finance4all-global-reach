#!/usr/bin/env python3
"""Validate a bounded Finance4All point-in-time dataset card against exact local bytes.

This tool performs local structural checks only. It does not fetch data, verify a
publisher's truthfulness, grant a licence, prove survivorship completeness, or
authorise a research outcome.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

VERSION = "1.0.0"
MAX_CARD_BYTES = 1024 * 1024
MAX_DATA_BYTES = 100 * 1024 * 1024
PLACEHOLDERS = {"unknown", "tbd", "none", "n/a", "na"}
REQUIRED_TEXT = (
    "dataset_id",
    "source_title",
    "source_url",
    "source_vintage",
    "license_note",
    "redistribution_rule",
    "release_time_policy",
    "availability_time_policy",
    "observation_time_field",
    "availability_time_field",
)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_bounded(path: Path, limit: int) -> bytes:
    with path.open("rb") as handle:
        raw = handle.read(limit + 1)
    if len(raw) > limit:
        raise ValueError(f"{path.name} exceeds {limit} bytes")
    return raw


def timestamp(value: Any) -> datetime:
    if not isinstance(value, str) or not re.match(r"^\d{4}-\d{2}-\d{2}T", value):
        raise ValueError("full ISO-8601 timestamp required")
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("invalid ISO-8601 timestamp") from exc
    if dt.tzinfo is None or dt.utcoffset() is None:
        raise ValueError("timezone is required")
    return dt.astimezone(timezone.utc)


def strict_json(raw: bytes) -> dict[str, Any]:
    def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
        out: dict[str, Any] = {}
        for key, value in items:
            if key in out:
                raise ValueError(f"duplicate JSON key: {key}")
            out[key] = value
        return out

    def constant(_value: str) -> Any:
        raise ValueError("non-finite JSON constants are not allowed")

    def parse_float(value: str) -> float:
        parsed = float(value)
        if not math.isfinite(parsed):
            raise ValueError("JSON number outside finite range")
        return parsed

    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=constant, parse_float=parse_float)
    if not isinstance(value, dict):
        raise ValueError("dataset card root must be an object")
    return value


def validate(card: dict[str, Any], data_sha256: str) -> dict[str, Any]:
    errors: list[str] = []

    if type(card.get("version")) is not int or card.get("version") != 1:
        errors.append("version must be integer 1")

    for field in REQUIRED_TEXT:
        value = card.get(field)
        if not isinstance(value, str) or len(value.strip()) < 3 or value.strip().lower() in PLACEHOLDERS:
            errors.append(f"{field} must be substantive")

    source_url = card.get("source_url")
    if isinstance(source_url, str) and not re.match(r"^https://", source_url):
        errors.append("source_url must use https")

    expected = card.get("local_sha256")
    if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-f]{64}", expected):
        errors.append("local_sha256 must be 64 lowercase hex characters")
    elif expected != data_sha256:
        errors.append("local_sha256 does not match exact data bytes")

    try:
        retrieved = timestamp(card.get("retrieved_at"))
    except ValueError:
        retrieved = None
        errors.append("retrieved_at must be timezone-aware ISO-8601")

    published_raw = card.get("published_at")
    published = None
    if published_raw is not None:
        try:
            published = timestamp(published_raw)
        except ValueError:
            errors.append("published_at must be null or timezone-aware ISO-8601")

    if retrieved and published and published > retrieved:
        errors.append("published_at cannot be after retrieved_at")

    if card.get("availability_time_field") == card.get("observation_time_field"):
        errors.append("availability_time_field must be distinct from observation_time_field")

    if card.get("redistribution_rule", "").strip().lower() in {"allowed", "yes"}:
        errors.append("redistribution_rule must state the actual bounded rule/terms, not a bare yes/allowed")

    return {
        "validator_version": VERSION,
        "status": "PASS" if not errors else "FAIL",
        "dataset_id": card.get("dataset_id"),
        "data_sha256": data_sha256,
        "errors": errors,
        "scope": (
            "Local metadata and exact-byte binding only; does not establish source truth, "
            "licence permission, completeness, survivorship coverage, or research approval."
        ),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--card", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    args = parser.parse_args(argv)

    try:
        card_raw = read_bounded(args.card, MAX_CARD_BYTES)
        data_raw = read_bounded(args.data, MAX_DATA_BYTES)
        card = strict_json(card_raw)
        result = validate(card, digest(data_raw))
    except (OSError, ValueError, TypeError, json.JSONDecodeError, RecursionError, OverflowError) as exc:
        print(json.dumps({"status": "ERROR", "error": str(exc)}), file=sys.stderr)
        return 2

    print(json.dumps(result, indent=2, allow_nan=False))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
