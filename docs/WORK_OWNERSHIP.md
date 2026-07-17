# Work Ownership

Coordination file for parallel agents. Claim before editing; release after commit or handoff.

## Active claims

| Agent | Claimed paths / subsystem | Task | Claimed at (UTC) | Status |
| --- | --- | --- | --- | --- |
| — | — | — | — | None active |

## Released / completed claims

| Agent | Paths | Released at | Notes |
| --- | --- | --- | --- |
| Cursor (Pass 1) | `docs/**` memory set, README, `.env.example`, `index.html`, absorbed portal/landing/admin/types/test fixes | 2026-07-17T13:45:00Z | Pass 1 complete; ready for Pass 2 claim on Debrief schema |

## Rules

1. Prefer coherent subsystem ownership (docs, auth, portal feature X) over overlapping file edits.
2. Do not edit files in an ACTIVE claim unless the claim is older than 4 hours with no update, or the owning agent explicitly released it.
3. After finishing a batch: update this file, `docs/CHANGELOG.md`, `docs/EXECUTION_STATUS.md`, and `docs/PROJECT_MEMORY.md`.
4. Uncommitted parallel work: leave a note under **Handoffs** before switching subsystems.

## Handoffs

| From | To | Summary | Timestamp |
| --- | --- | --- | --- |
| Cursor Pass 1 | Pass 2 agent | Memory frozen. Next: queue 1.1 Debrief `approved_sources` + editorial schema. Owner must still run OA-1. Working tree may have uncommitted Pass 1 docs/code — commit before parallel edits. | 2026-07-17T13:45:00Z |
