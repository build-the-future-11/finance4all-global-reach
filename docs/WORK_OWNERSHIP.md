# Work Ownership

Coordination file for parallel agents. Claim before editing; release after commit or handoff.

## Active claims

| Agent | Claimed paths / subsystem | Task | Claimed at (UTC) | Status |
| --- | --- | --- | --- | --- |
| — | — | — | — | none |

## Released / completed claims

| Agent | Paths | Released at | Notes |
| --- | --- | --- | --- |
| Cursor (Pass 2) | Debrief Wave 1 slice (`013_*`, FINAL_SETUP/VERIFY, debrief libs, Admin/Debriefed, weekly-digest, types/mappers, docs) | 2026-07-17T14:10:00Z | Checkpoint `3f3f43d` |
| Cursor (Pass 1) | Pass 1 memory + light fixes | 2026-07-17T13:45:00Z | Checkpoint `40bc348` |

## Rules

1. Prefer coherent subsystem ownership over overlapping file edits.
2. Do not edit files in an ACTIVE claim unless stale (>4h) or released.
3. After finishing a batch: update this file, CHANGELOG, EXECUTION_STATUS, PROJECT_MEMORY.
4. Uncommitted parallel work: note under Handoffs.

## Handoffs

| From | To | Summary | Timestamp |
| --- | --- | --- | --- |
| Pass 1 | Pass 2 | Queue 1.1 Debrief schema + publish guards | 2026-07-17T13:45:00Z |
| Pass 2 | Pass 3 | Wave 1 Debrief done in source; next 2.1 studio/essay moderation | 2026-07-17T14:10:00Z |
