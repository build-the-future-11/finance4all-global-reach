#!/usr/bin/env python3
"""Bounded, fail-closed checks for a fixed train/validation/test finance study.

No model training, market data retrieval, or outcome computation is performed.
A passing receipt is not proof of scientific validity or permission to run a study.
Python 3.10+; standard library only.
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import io
import json
import math
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

VERSION = "1.0.0"
SPLITS = ("train", "validation", "test")
TIMES = ("feature_observed_at", "feature_available_at", "prediction_at",
         "label_end_at", "label_available_at")
REQUIRED = ("row_id", "entity_id", "split") + TIMES
LIMIT_BYTES = 25 * 1024 * 1024
LIMIT_ROWS = 100_000


def timestamp(value: Any) -> datetime:
    """Require an explicit timezone; normalize equivalent instants to UTC."""
    if not isinstance(value, str) or not re.match(r"^\d{4}-\d{2}-\d{2}T", value):
        raise ValueError("Use a full ISO-8601 timestamp with timezone.")
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("Invalid ISO timestamp.") from exc
    if dt.tzinfo is None or dt.utcoffset() is None:
        raise ValueError("Timezone is required.")
    return dt.astimezone(timezone.utc)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def audit(rows: list[dict[str, Any]], manifest: dict[str, Any],
          dataset_sha256: str, protocol_sha256: str) -> dict[str, Any]:
    """Return all detected checks (bounded detail); never execute supplied content."""
    errors: list[dict[str, Any]] = []
    total_errors = 0

    def fail(code: str, message: str, row_number: int | None = None) -> None:
        nonlocal total_errors
        total_errors += 1
        if len(errors) < 100:
            item: dict[str, Any] = {"code": code, "message": message}
            if row_number is not None:
                item["csv_row"] = row_number
            errors.append(item)

    if not isinstance(manifest, dict):
        manifest = {}
        fail("MANIFEST_TYPE", "Manifest must be an object.")
    if manifest.get("version") != 1 or isinstance(manifest.get("version"), bool):
        fail("VERSION", "Only manifest version 1 is supported.")
    if manifest.get("evaluation_mode") != "fixed_holdout":
        fail("MODE", "This gate supports fixed holdout only; rolling studies need a separate audited contract.")
    for field in ("study_id", "data_source", "license_note", "universe_policy", "turnover_definition"):
        v = manifest.get(field)
        if not isinstance(v, str) or len(v.strip()) < 3 or v.strip().lower() in {"unknown", "tbd", "none"}:
            fail("METADATA", f"A substantive {field} is required; content still needs human review.")
    for field, actual in (("dataset_sha256", dataset_sha256), ("protocol_sha256", protocol_sha256)):
        expected = manifest.get(field)
        if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-f]{64}", expected) or expected != actual:
            fail("HASH", f"{field} does not match the exact local bytes.")
    costs = manifest.get("costs")
    if not isinstance(costs, dict):
        costs = {}
        fail("COSTS", "Explicit base and stress transaction-cost assumptions are required.")
    for field in ("one_way_bps", "stress_one_way_bps"):
        v = costs.get(field)
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or v < 0:
            fail("COST_VALUE", f"{field} must be a finite nonnegative number in basis points.")
    base, stress = costs.get("one_way_bps"), costs.get("stress_one_way_bps")
    if all(isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) for v in (base, stress)):
        if stress <= base:
            fail("COST_STRESS", "Stress cost must be greater than base cost.")
        if base == 0 and (not isinstance(costs.get("zero_cost_reason"), str) or len(costs["zero_cost_reason"].strip()) < 10):
            fail("ZERO_COST", "A zero-cost baseline needs an explicit reason and positive stress cost.")
    cutoffs: dict[str, datetime] = {}
    for field in ("fit_cutoff_at", "selection_cutoff_at"):
        try:
            cutoffs[field] = timestamp(manifest.get(field))
        except ValueError:
            fail("CUTOFF", f"{field} must be a valid timezone-aware timestamp.")
    if not isinstance(rows, list) or not 1 <= len(rows) <= LIMIT_ROWS:
        fail("ROW_COUNT", f"Dataset must contain 1–{LIMIT_ROWS} rows.")
        rows = []
    groups: dict[str, list[dict[str, datetime]]] = {s: [] for s in SPLITS}
    seen_ids: set[str] = set()
    seen_events: set[tuple[str, datetime]] = set()
    for i, row in enumerate(rows, 2):
        if not isinstance(row, dict) or any(k not in row or row[k] is None or not str(row[k]).strip() for k in REQUIRED):
            fail("ROW_SCHEMA", "Missing required row field.", i)
            continue
        if any(not isinstance(row[k], str) or len(row[k]) > 200 for k in ("row_id", "entity_id", "split")):
            fail("ID_TYPE", "Identifiers and split must be text, at most 200 characters.", i)
            continue
        rid, eid, split = row["row_id"].strip(), row["entity_id"].strip(), row["split"]
        if rid in seen_ids:
            fail("DUPLICATE_ID", "Duplicate row identifier.", i)
        seen_ids.add(rid)
        if split not in SPLITS:
            fail("SPLIT", "Split must be train, validation, or test.", i)
            continue
        try:
            t = {k: timestamp(row[k]) for k in TIMES}
        except ValueError:
            fail("TIME", "Invalid or timezone-naive row timestamp.", i)
            continue
        event = (eid, t["prediction_at"])
        if event in seen_events:
            fail("DUPLICATE_EVENT", "Entity/prediction instant duplicated, including timezone-equivalent copies.", i)
        seen_events.add(event)
        if t["feature_observed_at"] > t["feature_available_at"]:
            fail("OBSERVED_AFTER_AVAILABLE", "Feature observation occurs after stated availability.", i)
        if t["feature_available_at"] > t["prediction_at"]:
            fail("LOOKAHEAD", "Feature was not available by prediction time.", i)
        if t["label_end_at"] <= t["prediction_at"]:
            fail("LABEL_HORIZON", "Forward label must end strictly after prediction.", i)
        if t["label_available_at"] < t["label_end_at"]:
            fail("LABEL_AVAILABILITY", "Label cannot be available before its horizon ends.", i)
        groups[split].append(t)
    for split, group in groups.items():
        if not group:
            fail("EMPTY_SPLIT", f"No valid rows in {split} split.")
    for left, right in zip(SPLITS, SPLITS[1:]):
        if groups[left] and groups[right]:
            first_right = min(x["prediction_at"] for x in groups[right])
            if max(x["prediction_at"] for x in groups[left]) >= first_right:
                fail("SPLIT_ORDER", f"Prediction times overlap between {left} and {right}.")
            if max(x["label_available_at"] for x in groups[left]) >= first_right:
                fail("LABEL_PURGE", f"{left} labels extend to or beyond first {right} prediction.")
    for split, next_split, name in (("train", "validation", "fit_cutoff_at"), ("validation", "test", "selection_cutoff_at")):
        if name in cutoffs and groups[split] and groups[next_split]:
            cutoff = cutoffs[name]
            if max(x["label_available_at"] for x in groups[split]) > cutoff:
                fail("FIT_BEFORE_LABELS", f"{name} precedes required label availability.")
            if cutoff >= min(x["prediction_at"] for x in groups[next_split]):
                fail("FIT_AFTER_EVAL", f"{name} is not strictly before {next_split} predictions.")
    return {"gate_version": VERSION, "status": "PASS" if total_errors == 0 else "FAIL",
            "rows": len(rows), "split_rows": {k: len(v) for k, v in groups.items()},
            "error_count": total_errors, "errors": errors,
            "errors_truncated": total_errors > len(errors),
            "dataset_sha256": dataset_sha256, "protocol_sha256": protocol_sha256,
            "scope": "Structural fixed-holdout checks only; metadata may be false. Does not certify alpha, real data provenance, survivorship completeness, permissions, or approval for outcome runs."}


def read_bounded(path: Path, limit: int = LIMIT_BYTES) -> bytes:
    with path.open("rb") as handle:
        raw = handle.read(limit + 1)
    if len(raw) > limit:
        raise ValueError(f"Input exceeds {limit} bytes.")
    return raw


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--protocol", required=True, type=Path)
    parser.add_argument("--receipt", type=Path, help="New receipt path; existing files are never overwritten.")
    args = parser.parse_args(argv)
    try:
        raw = read_bounded(args.data)
        protocol = read_bounded(args.protocol)
        manifest_raw = read_bounded(args.manifest, 1024 * 1024)
        manifest = json.loads(manifest_raw)
        reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
        if not reader.fieldnames or len(set(reader.fieldnames)) != len(reader.fieldnames):
            raise ValueError("CSV requires a unique, nonempty header.")
        rows = []
        for row in reader:
            if None in row:
                raise ValueError("CSV row has extra unlabelled columns.")
            rows.append(row)
            if len(rows) > LIMIT_ROWS:
                raise ValueError("Dataset row limit exceeded.")
        receipt = audit(rows, manifest, digest(raw), digest(protocol))
        receipt["manifest_sha256"] = digest(manifest_raw)
        receipt["gate_sha256"] = digest(Path(__file__).read_bytes())
        output = json.dumps(receipt, indent=2, allow_nan=False) + "\n"
        if args.receipt:
            with args.receipt.open("x", encoding="utf-8") as handle:
                handle.write(output)
        print(output, end="")
        return 0 if receipt["status"] == "PASS" else 1
    except (OSError, ValueError, TypeError, csv.Error) as exc:
        print(json.dumps({"status": "ERROR", "error": str(exc)}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
