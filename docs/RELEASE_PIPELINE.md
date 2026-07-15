# Release Pipeline

Status: portfolio release pipeline template.

## Local Gate

Run for each active product:

1. Install dependencies from the lockfile.
2. Run unit tests.
3. Run typecheck.
4. Run lint.
5. Run production build with canonical URL configured.
6. Run dependency audit at high severity or higher.
7. Run e2e or browser smoke tests for public, auth, protected, and admin routes.
8. Run diff whitespace check.

## Environment Gate

Before public release:

1. Apply database migrations in order.
2. Verify RLS and storage policies.
3. Configure auth redirects, OAuth providers, email templates, and sender
   domains.
4. Deploy serverless/Edge Functions with secrets.
5. Verify monitoring, backups, and incident ownership.
6. Run multi-role smoke tests with production test accounts.

## Content And Policy Gate

1. Remove demo data.
2. Approve legal pages.
3. Approve public copy and claims.
4. Confirm support contacts and data-retention process.
5. Freeze launch content.

## Release Decision

Use these states:

- Ready for production testing: code checks pass; external configuration still
  needs live verification.
- Ready for public launch: code, environment, content, legal, and live smoke
  tests pass.
- Blocked: a missing credential, account, path, or owner decision prevents a
  required verification.
