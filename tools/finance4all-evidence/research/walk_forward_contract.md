# Walk-forward / rolling evaluation contract — review draft

**Related portfolio:** F4A-02.  
**Status:** specification only. The current `evidence_gate.py` intentionally rejects rolling/walk-forward mode. This document does not change that behavior or authorise a result-bearing run.

## Why a separate contract is required

A single fixed train/validation/test cutoff cannot express repeated refits safely. For each fold, a verifier must know exactly which features and labels were available at fit time, which observations were used for model selection, when predictions were emitted, and whether universe membership/cost assumptions were known without future information.

## Required per-fold record

Each fold must eventually bind at least:

- `fold_id`;
- training start/end prediction timestamps;
- maximum training label-availability timestamp;
- fit cutoff timestamp;
- validation start/end prediction timestamps;
- maximum validation label-availability timestamp;
- selection cutoff timestamp;
- test start/end prediction timestamps;
- model/config hash;
- dataset/version hash;
- universe snapshot hash or rule;
- cost/slippage assumption ID;
- output receipt hash.

All timestamps are timezone-aware and represent availability, not just economic observation dates.

## Fail-closed rules

A future implementation must reject the fold if:

1. any training feature became available after the prediction it supports;
2. any training label used by fitting was unavailable at the fit cutoff;
3. the fit cutoff is at or after the first validation prediction;
4. any validation label used for selection was unavailable at the selection cutoff;
5. the selection cutoff is at or after the first test prediction;
6. earlier labels cross into a later evaluation period without the predeclared purge/embargo rule;
7. the universe/constituent set uses information not available at the fold cutoff;
8. transaction-cost inputs were selected after inspecting the fold outcome;
9. folds overlap in a way that duplicates the same prediction event without an explicit paired-design rule;
10. a held-out final test is repeatedly exposed for tuning.

## Universe and survivorship audit

The rolling gate must carry a separate receipt for how entities enter/leave the eligible universe. A present-day constituent list is not automatically valid for historical evaluation. Delistings, missing histories and corporate-action adjustments require an explicit documented policy.

## Costs

Base and stress costs are frozen before the evaluation. If costs vary by date/entity, their historical availability and mapping are part of the source contract. Zero costs require a substantive synthetic/comparator reason.

## Implementation gate

Do not extend `evidence_gate.py` to accept `walk_forward` until:

- a canonical study requiring it is identified;
- a reviewer approves the exact fold schema;
- planted look-ahead, late-label, survivorship/universe and cost-selection failures exist;
- clean synthetic controls pass;
- backward compatibility leaves fixed-holdout behavior unchanged.

The safe current behavior is rejection.
