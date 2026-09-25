# Finance4All evidence gate — v1.1.0

Related portfolio: F4A-01 / F4A-02 / F4A-04. Engineering contribution, not a complete research audit or a study result.

A Python 3.10+ standard-library checker for a declared fixed-holdout study. It performs no training, market-data download, outcome computation, authentication, or database mutation. A PASS is not research approval.

## Run from the repository root

```sh
python3 -m unittest discover -s tools/finance4all-evidence/tests -p 'test_*.py' -v
```

The current suite contains 54 tests: the original 34 synthetic gate tests plus 20 malformed-input and compatibility tests. All passed locally on 25 September 2026. The scoped `Finance Evidence Gate` workflow runs the same suite; inspect the exact-commit Actions result rather than treating the unrelated portal CI as proof these tests ran.

For the standalone delivery archive, the equivalent command is `python3 -m unittest discover -s tests -p 'test_*.py' -v`.

## Validate an approved local evidence package

```sh
python3 tools/finance4all-evidence/research/evidence_gate.py \
  --data /path/to/rows.csv \
  --manifest /path/to/manifest.json \
  --protocol /path/to/frozen-protocol.md \
  --receipt /path/to/new-receipt.json
```

Exit 0: implemented checks pass. Exit 1: structural check failure. Exit 2: malformed input or IO failure. Receipts refuse overwrite and bind exact dataset, protocol, manifest, and gate bytes.

CSV fields: `row_id,entity_id,split,feature_observed_at,feature_available_at,prediction_at,label_end_at,label_available_at`. Every timestamp must state its timezone. Splits are exactly `train`, `validation`, and `test`. Duplicate entity/prediction instants are rejected after timezone normalization.

Manifest fields: integer `version` 1; `evaluation_mode` `fixed_holdout`; `study_id`, `data_source`, `license_note`, `universe_policy`, `turnover_definition`; lowercase `dataset_sha256` and `protocol_sha256`; `fit_cutoff_at`, `selection_cutoff_at`; and `costs` containing finite nonnegative `one_way_bps` plus a strictly greater `stress_one_way_bps`. Zero base cost needs a substantive `zero_cost_reason`.

## Input hardening added in v1.1.0

Reject duplicate JSON keys (including nested objects), nonfinite constants, floating-point overflow, a non-object root, and excessive nesting. Oversized integer costs produce a structured failure instead of an uncaught overflow. Require a nonempty UTF-8 protocol without NUL bytes, a nonblank complete CSV header, and well-formed quoted CSV. Reject floating-point manifest versions such as `1.0`; unknown well-formed metadata remains allowed. The tests preserve previously passing valid inputs.

Local limits remain 25 MiB per data/protocol input, 1 MiB per manifest, 100,000 rows, 64 levels of decoded manifest nesting, and at most 100 reported error details. These are bounded local-file controls, not a sandbox for running untrusted programs.

## Scientific boundaries

Data producers can supply false timestamps or metadata. This checker does not prove true source availability, permission, complete survivorship coverage, absence of hidden features/cross-entity leakage, fee application, investment value, or novelty. Rolling/walk-forward designs are rejected pending a separately reviewed per-fold contract.

Training labels must be available by the fit cutoff, which must precede validation. Validation labels must be available by the selection cutoff, which must precede test. Earlier-split label availability must be strictly earlier than the next split's first prediction. This conservative fixed-model contract is not suitable for every study.

No frozen protocol, held-out test, seed restriction, metric, or baseline is changed. No existing FinanceMeta study has been certified. Production migration, authentication, RLS, privacy, and independent review remain separate gates. Adopt a checker through explicit change control, not by silently revising a frozen study.
