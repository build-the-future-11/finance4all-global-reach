"""Synthetic tests for Finance4All dataset-card and claim-registry controls."""
import copy
import hashlib
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "research"))

from dataset_card import validate as validate_card
from claim_registry import validate as validate_claims


class DatasetCardTests(unittest.TestCase):
    def setUp(self):
        self.data = b"row_id,value\na,1\n"
        self.sha = hashlib.sha256(self.data).hexdigest()
        self.card = {
            "version": 1,
            "dataset_id": "SYNTHETIC-DATASET-ONLY",
            "source_title": "Synthetic local fixture",
            "source_url": "https://example.invalid/synthetic-fixture",
            "source_vintage": "synthetic-v1",
            "license_note": "Synthetic fixture authored for tests; not a market-data licence.",
            "redistribution_rule": "Synthetic fixture may be redistributed only as part of these tests.",
            "release_time_policy": "Synthetic rows have a declared generated release timestamp.",
            "availability_time_policy": "Availability is represented by a distinct availability timestamp.",
            "observation_time_field": "observed_at",
            "availability_time_field": "available_at",
            "retrieved_at": "2026-09-28T16:00:00Z",
            "published_at": "2026-09-28T15:00:00Z",
            "local_sha256": self.sha,
        }

    def test_valid_card_passes(self):
        self.assertEqual(validate_card(copy.deepcopy(self.card), self.sha)["status"], "PASS")

    def test_hash_mismatch_fails(self):
        out = validate_card(copy.deepcopy(self.card), "a" * 64)
        self.assertEqual(out["status"], "FAIL")
        self.assertIn("local_sha256 does not match exact data bytes", out["errors"])

    def test_placeholder_metadata_fails(self):
        card = copy.deepcopy(self.card)
        card["license_note"] = "TBD"
        self.assertEqual(validate_card(card, self.sha)["status"], "FAIL")

    def test_availability_field_must_be_distinct(self):
        card = copy.deepcopy(self.card)
        card["availability_time_field"] = card["observation_time_field"]
        out = validate_card(card, self.sha)
        self.assertIn("availability_time_field must be distinct from observation_time_field", out["errors"])

    def test_future_published_time_fails(self):
        card = copy.deepcopy(self.card)
        card["published_at"] = "2026-09-28T17:00:00Z"
        self.assertEqual(validate_card(card, self.sha)["status"], "FAIL")


class ClaimRegistryTests(unittest.TestCase):
    def draft(self):
        return {
            "version": 1,
            "claims": [
                {
                    "claim_id": "SYNTHETIC-CLAIM-1",
                    "project_id": "F4A-04",
                    "claim_text": "Synthetic infrastructure fixture only; no real program or research outcome.",
                    "status": "DRAFT",
                    "protocol_id": "",
                    "evidence_refs": [],
                    "reviewer": "UNASSIGNED",
                    "reviewed_at": None,
                    "public_wording": "",
                }
            ],
        }

    def test_draft_fixture_passes(self):
        self.assertEqual(validate_claims(self.draft())["status"], "PASS")

    def test_draft_cannot_have_public_wording(self):
        value = self.draft()
        value["claims"][0]["public_wording"] = "This is ready to publish."
        self.assertEqual(validate_claims(value)["status"], "FAIL")

    def test_allowed_requires_evidence_and_reviewer(self):
        value = self.draft()
        claim = value["claims"][0]
        claim["status"] = "ALLOWED"
        claim["public_wording"] = "Bounded synthetic claim for test purposes only."
        out = validate_claims(value)
        self.assertEqual(out["status"], "FAIL")
        self.assertTrue(any("requires at least one evidence reference" in e for e in out["errors"]))
        self.assertTrue(any("requires named reviewer" in e for e in out["errors"]))

    def test_complete_allowed_record_passes(self):
        value = self.draft()
        claim = value["claims"][0]
        claim.update(
            status="ALLOWED",
            protocol_id="SYNTHETIC-PROTOCOL-V1",
            evidence_refs=["tests/synthetic-receipt.json"],
            reviewer="Synthetic Reviewer",
            reviewed_at="2026-09-28T16:30:00Z",
            public_wording="Synthetic test control passed its declared fixture checks only.",
            evidence_commit="a" * 40,
        )
        self.assertEqual(validate_claims(value)["status"], "PASS")

    def test_withdrawn_requires_correction_note(self):
        value = self.draft()
        claim = value["claims"][0]
        claim.update(status="WITHDRAWN", reviewed_at="2026-09-28T16:30:00Z")
        self.assertEqual(validate_claims(value)["status"], "FAIL")


if __name__ == "__main__":
    unittest.main(verbosity=2)
