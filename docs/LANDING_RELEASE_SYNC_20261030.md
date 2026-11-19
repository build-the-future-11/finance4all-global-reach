# Landing release synchronization: 30 October 2026

## Repair

The portal's public QA inventory still expected FinanceMeta Landing revision
`1e1c62d7d70364357d719b60a24adcf09780258b`. The public origin now serves
`0794d6664942eff02a8d6fc3a048a67c1910e061`, the merged dependency release in
[Landing PR #122](https://github.com/build-the-future-11/FinanceMeta-Landing/pull/122).

Change only the inventory's immutable revision to that verified deployed commit.
The origin, all 202 route paths, browser assertions, accessibility checks,
performance budgets, and before/after revision checks are unchanged.

This repair is based on portal draft PR #177 at
`8de07b66253da2c67c8c67e2b45c28e761f8a642`. It preserves the catalog-filter race
repair already present in that branch.

## Evidence for the new pin

- The live `/release-revision.json` endpoint returned service
  `finance-meta-landing` and revision `0794d6664942eff02a8d6fc3a048a67c1910e061`
  before and after this session's public route audit.
- GitHub's [immutable comparison](https://github.com/build-the-future-11/FinanceMeta-Landing/compare/1e1c62d7d70364357d719b60a24adcf09780258b...0794d6664942eff02a8d6fc3a048a67c1910e061)
  reports the deployed revision four commits ahead and zero behind. The only
  changed files are `package.json` and `package-lock.json`: the combined Motion
  14.4.0 and PostCSS 8.5.31 dependency updates.
- PR #122 is merged, with the same merge SHA observed on the public origin.
  Its candidate head `1b67a19427f361e201e06c29a69c0e6ca26cd6a3` passed
  [Release Check 39777596760](https://github.com/build-the-future-11/FinanceMeta-Landing/actions/runs/39777596760).
- All 202 declared routes returned HTTP 200, an HTML H1, and the expected
  canonical URL. The full GET-only receipt is
  [`../evidence/public-qa-20261030-http.json`](../evidence/public-qa-20261030-http.json).
  This checks server-rendered HTML only; it is not a browser, accessibility,
  responsive-layout, or performance acceptance receipt.

## Local validation

The locked install completed with 448 packages. On Node 24.22.1 / npm 11.9.0,
the existing `npm test` command passed all 468 application tests, 99 Node
contract tests, and 12 toolchain tests. Typecheck, repository lint, and patch
whitespace validation also passed. The runtime satisfies the package's
Node floor but differs from the CI-pinned Node 22.23.2 / npm 10.9.8 environment;
fresh hosted validation remains required.

An initial sandbox attempt could not create test subprocesses (`EPERM`) and
was stopped. The same unmodified suite then passed outside that process
sandbox. No assertion, timeout, retry setting, or release gate was weakened.

The repository-pinned browser installation failed on the Chromium 156 archive
with `End of central directory record signature not found`. Fresh browser QA
and performance tests therefore remain unrun locally. Hosted CI must validate
this published candidate with the unchanged browser checks.

## Corrected status

The latest failure on #177 was not a portal performance regression or a stale
unit-test assertion. Its [verify job](https://github.com/build-the-future-11/finance4all-global-reach/actions/runs/39824230619/job/120214264975)
passed all 468 application tests, 99 Node contract tests, production and
component builds, and 180 browser journeys. Both local portal performance
targets passed. The two external Landing targets failed before measurements
because the immutable revision differed. The separate public browser job was
cancelled during browser installation, so that job did not certify the routes.

The database-authorization job on the same run succeeded. This historical
disposable-database result does not certify the current production database,
authentication settings, or live member accounts. No deployment, migration,
account change, or production promotion is part of this repair.
