# Finance4All evidence gate — engineering contribution

Prepared 25 September 2026. Related portfolio: F4A-01/F4A-02/F4A-04.

This isolated Python 3.10+ standard-library tool validates a declared fixed-holdout study's CSV timestamp structure, split boundaries, label availability, fitting/selection cutoffs, exact dataset/protocol hashes, and presence of base/stress transaction-cost assumptions. It performs no training, retrieves no market data, changes no portal routes or database state, and does not authorize research runs.

## Run the tests

From the repository root:

```sh
python3 -m unittest discover -s tools/finance4all-evidence/tests -p 'test_evidence_gate.py' -v
```

All 34 tests passed locally on synthetic fixtures before this draft PR. Repository CI, independent review, and checks on existing real study datasets are separate and are not claimed.

## Run on an approved local evidence package

```sh
python3 tools/finance4all-evidence/research/evidence_gate.py \
  --data /path/to/rows.csv \
  --manifest /path/to/manifest.json \
  --protocol /path/to/frozen-protocol.md \
  --receipt /path/to/new-receipt.json
```

Exit 0 means the implemented structural checks passed; exit 1 means check failures; exit 2 means invalid input or IO failure. Receipts refuse overwrite. The CLI hashes the exact data, protocol, manifest, and gate bytes. It does not execute imported code.

CSV fields: `row_id,entity_id,split,feature_observed_at,feature_available_at,prediction_at,label_end_at,label_available_at`. Every time must include its timezone. Splits are exactly `train`, `validation`, and `test`. Equivalent entity/timestamp duplicates are rejected even when written in different timezones.

Manifest fields: `version` (1), `evaluation_mode` (`fixed_holdout`), `study_id`, `data_source`, `license_note`, `universe_policy`, `turnover_definition`, lowercase `dataset_sha256`, lowercase `protocol_sha256`, `fit_cutoff_at`, `selection_cutoff_at`, and `costs` containing `one_way_bps` and a greater `stress_one_way_bps`. A zero base cost also needs a substantive `zero_cost_reason`. The tests contain a complete self-generated synthetic example.

## Boundaries and release gates

A data producer can provide false timestamps or metadata. Passing this gate does not prove actual source availability, data-use permission, survivorship completeness, lack of hidden features or cross-entity leakage, correct fee application, investment value, or scientific novelty. Rolling/walk-forward evaluation is deliberately rejected rather than silently treated as fixed holdout; implementing its per-fold contract remains separate work.

The fixed-model contract requires training labels to be available by the fit cutoff and that cutoff to precede validation. Validation labels must be available by the selection cutoff and that cutoff must precede test predictions. Earlier split labels must not extend to the next split's first prediction. This is conservative and may reject studies requiring another explicitly reviewed design.

No existing frozen study, held-out result, seed restriction, primary metric, or baseline is changed. This contribution does not resolve the portal's production migration/auth/RLS/privacy gates. Do not call it an external certification or a complete leakage audit suite.

Next review: confirm timestamp definitions against one canonical approved study, challenge the fixture coverage, independently rerun tests, then decide whether a successor reviewed protocol should adopt this component. Do not modify an already frozen protocol by implication.
