# Work Ownership

Coordination file for parallel agents. Claim before editing; release after commit or handoff.

## Active claims

| Agent | Claimed paths / subsystem | Task | Claimed at (UTC) | Status |
| --- | --- | --- | --- | --- |
| — | — | — | — | none |

## Released / completed claims

| Agent | Paths | Released at | Notes |
| --- | --- | --- | --- |
| Cursor (Pass 4) | e2e auth, RLS matrix, lint extract, Admin labs/versions, cert print, docs | 2026-07-17T14:35:00Z | Checkpoint `ebc0d75` |
| Cursor (Pass 3) | Wave 2 portal completeness | 2026-07-17T14:00:00Z | Checkpoint `14a20ed` |
| Cursor (Pass 2) | Debrief Wave 1 slice | 2026-07-17T14:10:00Z | Checkpoint `3f3f43d` |
| Cursor (Pass 1) | Pass 1 memory + light fixes | 2026-07-17T13:45:00Z | Checkpoint `40bc348` |

## Rules

1. Prefer coherent subsystem ownership over overlapping file edits.
2. Do not edit files in an ACTIVE claim unless stale (>4h) or released.
3. After finishing a batch: update this file, CHANGELOG, EXECUTION_STATUS, PROJECT_MEMORY.
4. Uncommitted parallel work: note under Handoffs.

## Handoffs

| From | To | Summary | Timestamp |
| --- | --- | --- | --- |
| Pass 3 | Pass 4 | Wave 2 done; start 3.1 authenticated e2e | 2026-07-17T14:00:00Z |
| Pass 4 | Owner / maintenance | Engineering Wave 3 done; live OA-* remain | 2026-07-17T14:35:00Z |
