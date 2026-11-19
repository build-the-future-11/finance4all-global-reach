"""Synthetic input-boundary regressions; no public or outcome-bearing claims."""
from __future__ import annotations

import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "research"))
import claim_registry


def draft() -> dict:
    return {"version": 1, "claims": [{
        "claim_id": "SYNTHETIC-CLAIM-1", "project_id": "F4A-04",
        "claim_text": "Synthetic control only, not a research outcome.",
        "status": "DRAFT", "evidence_refs": [], "public_wording": "",
    }]}


class ClaimRegistryInputIntegrityTests(unittest.TestCase):
    def cli(self, raw: bytes) -> tuple[int, str, str]:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "registry.json"
            path.write_bytes(raw)
            stdout, stderr = io.StringIO(), io.StringIO()
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                code = claim_registry.main([str(path)])
            return code, stdout.getvalue(), stderr.getvalue()

    def assert_cli_error(self, raw: bytes) -> None:
        code, out, err = self.cli(raw)
        self.assertEqual(code, 2)
        self.assertEqual(out, "")
        self.assertEqual(json.loads(err)["status"], "ERROR")
        self.assertNotIn("Traceback", err)

    def test_non_object_roots_fail_without_exception(self):
        for value in (None, [], "registry", 1, True):
            with self.subTest(value=value):
                result = claim_registry.validate(value)
                self.assertEqual(result["status"], "FAIL")
                self.assertEqual(result["claim_count"], 0)
                self.assertIn("registry root must be an object", result["errors"])

    def test_array_status_fails_without_exception(self):
        value = draft()
        value["claims"][0]["status"] = []
        self.assertEqual(claim_registry.validate(value)["status"], "FAIL")

    def test_object_status_fails_without_exception(self):
        value = draft()
        value["claims"][0]["status"] = {}
        self.assertEqual(claim_registry.validate(value)["status"], "FAIL")

    def test_duplicate_root_key_rejected(self):
        self.assert_cli_error(b'{"version":2,"version":1,"claims":[]}')

    def test_duplicate_claim_status_rejected(self):
        raw = json.dumps(draft()).replace('"status": "DRAFT"', '"status": "ALLOWED", "status": "DRAFT"')
        self.assert_cli_error(raw.encode())

    def test_nan_in_unknown_field_rejected(self):
        self.assert_cli_error(b'{"version":1,"claims":[],"metadata":NaN}')

    def test_infinity_in_unknown_field_rejected(self):
        self.assert_cli_error(b'{"version":1,"claims":[],"metadata":Infinity}')

    def test_overflowing_json_number_rejected(self):
        self.assert_cli_error(b'{"version":1,"claims":[],"metadata":1e309}')

    def test_input_size_is_bounded(self):
        with mock.patch.object(claim_registry, "MAX_REGISTRY_BYTES", 64, create=True):
            self.assert_cli_error(b'{"version":1,"claims":[]}' + b' ' * 65)

    def test_recursion_error_reports_machine_readable_error(self):
        with mock.patch.object(claim_registry.json, "loads", side_effect=RecursionError("synthetic parser error")):
            code, out, err = self.cli(b"{}")
        self.assertEqual(code, 2)
        self.assertEqual(out, "")
        self.assertEqual(json.loads(err)["status"], "ERROR")

    def test_draft_short_public_wording_is_not_accepted(self):
        value = draft()
        value["claims"][0]["public_wording"] = "OK"
        self.assertEqual(claim_registry.validate(value)["status"], "FAIL")

    def test_draft_placeholder_public_wording_is_not_accepted(self):
        value = draft()
        value["claims"][0]["public_wording"] = "TBD"
        self.assertEqual(claim_registry.validate(value)["status"], "FAIL")

    def test_draft_non_string_public_wording_is_not_accepted(self):
        for wording in ([], {}, False, 0):
            with self.subTest(wording=wording):
                value = draft()
                value["claims"][0]["public_wording"] = wording
                self.assertEqual(claim_registry.validate(value)["status"], "FAIL")

    def test_draft_empty_null_missing_wording_still_passes(self):
        for wording in (None, "", "  "):
            with self.subTest(wording=wording):
                value = draft()
                value["claims"][0]["public_wording"] = wording
                self.assertEqual(claim_registry.validate(value)["status"], "PASS")
        value = draft()
        del value["claims"][0]["public_wording"]
        self.assertEqual(claim_registry.validate(value)["status"], "PASS")

    def test_valid_cli_preserves_success_contract(self):
        code, out, err = self.cli(json.dumps(draft()).encode())
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)["status"], "PASS")
        self.assertEqual(err, "")

    def test_invalid_claim_cli_preserves_failure_contract(self):
        value = draft()
        value["claims"][0]["status"] = "UNKNOWN"
        code, out, err = self.cli(json.dumps(value).encode())
        self.assertEqual(code, 1)
        self.assertEqual(json.loads(out)["status"], "FAIL")
        self.assertEqual(err, "")

    def test_invalid_utf8_reports_error(self):
        self.assert_cli_error(b'\xff')

    def test_non_object_json_reports_error(self):
        self.assert_cli_error(b'[]')

    def test_allowed_record_still_requires_all_review_fields(self):
        value = draft()
        value["claims"][0].update(status="ALLOWED", public_wording="Synthetic wording only.")
        result = claim_registry.validate(value)
        self.assertEqual(result["status"], "FAIL")
        self.assertTrue(any("requires named reviewer" in error for error in result["errors"]))

    def test_complete_allowed_record_still_passes(self):
        value = draft()
        value["claims"][0].update(
            status="ALLOWED", protocol_id="SYNTHETIC-PROTOCOL-V1",
            public_wording="Synthetic test control only; no outcome claim.",
            evidence_refs=["tests/synthetic-receipt.json"], reviewer="Synthetic Reviewer",
            reviewed_at="2026-10-05T12:00:00Z", evidence_commit="a" * 40,
        )
        self.assertEqual(claim_registry.validate(value)["status"], "PASS")


if __name__ == "__main__":
    unittest.main(verbosity=2)
