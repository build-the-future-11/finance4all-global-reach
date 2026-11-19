# Finance4All evidence registry controls

This directory complements the fixed-holdout evidence gate.

## Dataset card

Bind reviewed source metadata to exact local bytes:

```sh
python3 tools/finance4all-evidence/research/dataset_card.py \
  --card path/to/dataset-card.json \
  --data path/to/data.csv
```

A PASS verifies the implemented local metadata/byte checks only. It does not grant a licence, prove that publisher metadata is true, or certify research use.

Start from `templates/dataset_card.template.json`.

## Claim registry

Validate public-claim records:

```sh
python3 tools/finance4all-evidence/research/claim_registry.py \
  path/to/claim-registry.json
```

A `DRAFT` may remain evidence-free but cannot contain releasable public wording. An `ALLOWED` claim requires a protocol ID, evidence reference, named reviewer, review timestamp and bounded public wording. Scientific validity and reviewer independence remain separate gates.

Start from `templates/claim_registry.template.json`.

## Walk-forward work

`research/walk_forward_contract.md` is a review specification, not an implementation. The v1.1 fixed-holdout gate continues to reject walk-forward studies until a separately reviewed per-fold contract and planted failure fixtures exist.
