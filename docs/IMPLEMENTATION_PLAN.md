# Implementation Plan

Status: post-hardening implementation plan. Items marked done were implemented
and verified in this repository; external items remain launch gates.

## Done In Code

- Hardened public/auth messaging so production users do not see raw provider,
  localhost, migration, or environment-key instructions.
- Added tests for production-safe auth/setup copy and auth-error sanitization.
- Tightened Supabase key validation to reject ambiguous publishable-key values.
- Added operational schema migration for analytics, error reports, digest logs,
  content write checks, RLS policies, grants, and retention support.
- Added Admin System visibility for product events, client error reports, and
  weekly digest delivery status.
- Hardened weekly digest delivery dedupe and account-deletion flow.
- Updated deployment, README, Supabase quickstart, launch checklist, product
  spec, and release audit for production handoff.
- Verified unit tests, e2e tests, lint, typecheck, build, browser smoke checks,
  diff whitespace, and production dependency audit.

## Release-Critical External Work

1. Apply migrations `001` through `012` in production Supabase.
2. Run migration verification SQL and RLS verification against production.
3. Deploy Edge Functions with documented secrets.
4. Configure Supabase Auth providers, redirect URLs, email templates, and sender.
5. Set hosting variables and canonical domain.
6. Promote two real administrators through a controlled database operation.
7. Remove demo records and publish only approved real content.
8. Complete privacy/terms review.
9. Run live smoke tests for visitor, member, research lead if enabled, and admin.

## Near-Term Product Improvements

- Add a staffed support workflow around contact submissions and deletion
  requests.
- Add dashboard-level observability for failed auth callbacks and Edge Function
  failures after the production logger is chosen.
- Add content governance fields for source review owner and review date if the
  organization wants a stricter editorial workflow.
- Add acceptance-test fixtures against a disposable Supabase project so RLS can
  be exercised in CI without touching production.

## Intentionally Deferred

- Payment, dues, or paid membership features.
- Unverified public impact metrics.
- Mentor matching and organization-owner workflows.
- Social network or direct messaging features.
- Investment advice, recommendations, or brokerage-adjacent functionality.
