"""Synthetic malformed-input regressions; no market data or research outcomes."""
import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import test_registry_controls as fixtures

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "research"))
import dataset_card


class DatasetCardInputTypeTests(unittest.TestCase):
    INVALID_TEXT = (None, False, 0, 42, 2.5, [], {})

    def setUp(self):
        fixture = fixtures.DatasetCardTests("test_valid_card_passes")
        fixture.setUp()
        self.card = fixture.card
        self.data = fixture.data
        self.sha = fixture.sha

    def check_cli(self, card, expected_code, expected_status):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "card.json").write_text(json.dumps(card), encoding="utf-8")
            (root / "data.csv").write_bytes(self.data)
            result = subprocess.run(
                [sys.executable, str(ROOT / "research" / "dataset_card.py"),
                 "--card", str(root / "card.json"), "--data", str(root / "data.csv")],
                capture_output=True, text=True, timeout=10, check=False,
            )
        self.assertEqual(result.returncode, expected_code, result.stderr)
        self.assertEqual(result.stderr, "", result.stderr)
        output = json.loads(result.stdout)
        self.assertEqual(output["status"], expected_status)
        return output

    def test_non_string_required_fields_return_fail(self):
        for field in dataset_card.REQUIRED_TEXT:
            for value in self.INVALID_TEXT:
                with self.subTest(field=field, value=value):
                    card = copy.deepcopy(self.card)
                    card[field] = value
                    result = dataset_card.validate(card, self.sha)
                    self.assertEqual(result["status"], "FAIL")
                    self.assertIn(f"{field} must be substantive", result["errors"])

    def test_missing_rule_returns_fail(self):
        card = copy.deepcopy(self.card)
        del card["redistribution_rule"]
        result = dataset_card.validate(card, self.sha)
        self.assertEqual(result["status"], "FAIL")
        self.assertIn("redistribution_rule must be substantive", result["errors"])

    def test_bare_permission_remains_rejected(self):
        for value in ("yes", "allowed", " YES ", " ALLOWED "):
            with self.subTest(value=value):
                card = copy.deepcopy(self.card)
                card["redistribution_rule"] = value
                result = dataset_card.validate(card, self.sha)
                self.assertEqual(result["status"], "FAIL")
                self.assertIn(
                    "redistribution_rule must state the actual bounded rule/terms, not a bare yes/allowed",
                    result["errors"],
                )

    def test_cli_non_string_rules_return_structured_fail(self):
        for value in self.INVALID_TEXT:
            with self.subTest(value=value):
                card = copy.deepcopy(self.card)
                card["redistribution_rule"] = value
                output = self.check_cli(card, 1, "FAIL")
                self.assertIn("redistribution_rule must be substantive", output["errors"])

    def test_cli_missing_rule_returns_structured_fail(self):
        card = copy.deepcopy(self.card)
        del card["redistribution_rule"]
        self.check_cli(card, 1, "FAIL")

    def test_cli_valid_card_still_passes(self):
        self.check_cli(copy.deepcopy(self.card), 0, "PASS")

    def test_validation_does_not_mutate_card(self):
        for value in self.INVALID_TEXT:
            with self.subTest(value=value):
                card = copy.deepcopy(self.card)
                card["redistribution_rule"] = value
                before = copy.deepcopy(card)
                dataset_card.validate(card, self.sha)
                self.assertEqual(card, before)


if __name__ == "__main__":
    unittest.main(verbosity=2)
