BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(27);

SELECT ok(
  NOT has_table_privilege('authenticated', 'private.financemeta_memberships', 'select'),
  'authenticated browser users cannot read the membership authority table directly'
);
SELECT ok(
  NOT has_function_privilege(
    'authenticated',
    'public.financemeta_grant_membership(uuid,text,uuid)',
    'execute'
  ),
  'authenticated browser users cannot grant membership'
);
SELECT ok(
  NOT has_function_privilege(
    'authenticated',
    'public.financemeta_reactivate_membership(uuid,text,bigint,uuid)',
    'execute'
  ),
  'authenticated browser users cannot reactivate membership'
);
SELECT ok(
  NOT has_function_privilege(
    'authenticated',
    'public.financemeta_set_membership_status(uuid,text,bigint,uuid)',
    'execute'
  ),
  'authenticated browser users cannot suspend or revoke membership'
);
SELECT ok(
  has_function_privilege(
    'service_role',
    'public.financemeta_grant_membership(uuid,text,uuid)',
    'execute'
  ),
  'service role owns the bounded initial membership grant path'
);
SELECT ok(
  has_function_privilege(
    'service_role',
    'public.financemeta_reactivate_membership(uuid,text,bigint,uuid)',
    'execute'
  ),
  'service role owns the revision-checked membership reactivation path'
);
SELECT ok(
  has_function_privilege(
    'service_role',
    'public.financemeta_set_membership_status(uuid,text,bigint,uuid)',
    'execute'
  ),
  'service role owns the revision-checked membership status path'
);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'membership-test@example.test', '',
  pg_catalog.now(), '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Membership Test"}'::jsonb,
  pg_catalog.now(), pg_catalog.now()
),
(
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated', 'membership-reactivator@example.test', '',
  pg_catalog.now(), '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Membership Reactivator"}'::jsonb,
  pg_catalog.now(), pg_catalog.now()
);

SET LOCAL ROLE service_role;
SELECT lives_ok(
  $$SELECT public.financemeta_grant_membership(
    '20000000-0000-0000-0000-000000000001',
    'test:controlled-enrollment',
    '20000000-0000-0000-0000-000000000001'
  )$$,
  'service-owned enrollment can explicitly grant membership with provenance'
);
RESET ROLE;

SELECT pg_catalog.set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000001',
  true
);
SELECT pg_catalog.set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;
SELECT ok(
  public.financemeta_is_member(),
  'explicitly enrolled identity satisfies the own-identity active-member predicate'
);
RESET ROLE;

SET LOCAL ROLE service_role;
SELECT throws_ok(
  $$SELECT public.financemeta_grant_membership(
    '20000000-0000-0000-0000-000000000001',
    'test:blind-regrant',
    '20000000-0000-0000-0000-000000000002'
  )$$,
  'P0003',
  'membership already exists; use revision-checked reactivation',
  'blind grant retries cannot overwrite an existing membership'
);
SELECT throws_ok(
  $$SELECT public.financemeta_set_membership_status(
    '20000000-0000-0000-0000-000000000001',
    'active',
    1,
    '20000000-0000-0000-0000-000000000001'
  )$$,
  '22023',
  'status changes must suspend or revoke membership',
  'status mutation cannot reactivate membership'
);
SELECT lives_ok(
  $$SELECT public.financemeta_set_membership_status(
    '20000000-0000-0000-0000-000000000001',
    'suspended',
    1,
    '20000000-0000-0000-0000-000000000001'
  )$$,
  'service role can suspend the exact membership revision it reviewed'
);
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT ok(
  NOT public.financemeta_is_member(),
  'suspended membership fails the active-member predicate'
);
RESET ROLE;

SELECT is(
  (SELECT revision FROM private.financemeta_memberships
   WHERE user_id = '20000000-0000-0000-0000-000000000001'),
  2::bigint,
  'suspension advances the optimistic-concurrency revision'
);

SET LOCAL ROLE service_role;
SELECT throws_ok(
  $$SELECT public.financemeta_reactivate_membership(
    '20000000-0000-0000-0000-000000000001',
    '   ',
    2,
    '20000000-0000-0000-0000-000000000002'
  )$$,
  '22023',
  'membership source must be between 1 and 120 characters',
  'reactivation fails closed without bounded provenance'
);
SELECT throws_ok(
  $$SELECT public.financemeta_reactivate_membership(
    '20000000-0000-0000-0000-000000000001',
    'test:stale-reactivation',
    1,
    '20000000-0000-0000-0000-000000000002'
  )$$,
  'P0003',
  'membership changed since it was read or is not inactive',
  'stale reactivation cannot overwrite a newer suspension'
);
SELECT lives_ok(
  $$SELECT public.financemeta_reactivate_membership(
    '20000000-0000-0000-0000-000000000001',
    'test:controlled-reactivation',
    2,
    '20000000-0000-0000-0000-000000000002'
  )$$,
  'reactivation succeeds only against the exact inactive revision'
);
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT ok(
  public.financemeta_is_member(),
  'revision-checked reactivation restores the active-member predicate'
);
RESET ROLE;

SELECT is(
  (SELECT source FROM private.financemeta_memberships
   WHERE user_id = '20000000-0000-0000-0000-000000000001'),
  'test:controlled-enrollment',
  'reactivation preserves the original grant source'
);
SELECT is(
  (SELECT granted_by::text FROM private.financemeta_memberships
   WHERE user_id = '20000000-0000-0000-0000-000000000001'),
  '20000000-0000-0000-0000-000000000001',
  'reactivation preserves the original grant actor'
);
SELECT is(
  (SELECT last_activation_source FROM private.financemeta_memberships
   WHERE user_id = '20000000-0000-0000-0000-000000000001'),
  'test:controlled-reactivation',
  'reactivation records its own bounded provenance separately'
);
SELECT is(
  (SELECT last_activated_by::text FROM private.financemeta_memberships
   WHERE user_id = '20000000-0000-0000-0000-000000000001'),
  '20000000-0000-0000-0000-000000000002',
  'reactivation records its own actor separately'
);
SELECT is(
  (SELECT revision FROM private.financemeta_memberships
   WHERE user_id = '20000000-0000-0000-0000-000000000001'),
  3::bigint,
  'reactivation advances the optimistic-concurrency revision'
);

SET LOCAL ROLE service_role;
SELECT throws_ok(
  $$SELECT public.financemeta_set_membership_status(
    '20000000-0000-0000-0000-000000000001',
    'revoked',
    2,
    '20000000-0000-0000-0000-000000000001'
  )$$,
  'P0003',
  'membership changed since it was read or already has that status',
  'stale status mutation cannot overwrite a newer reactivation'
);
SELECT lives_ok(
  $$SELECT public.financemeta_set_membership_status(
    '20000000-0000-0000-0000-000000000001',
    'revoked',
    3,
    '20000000-0000-0000-0000-000000000001'
  )$$,
  'current revision can be revoked explicitly'
);
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT ok(
  NOT public.financemeta_is_member(),
  'revoked membership fails the active-member predicate'
);
RESET ROLE;

SELECT is(
  (SELECT revision FROM private.financemeta_memberships
   WHERE user_id = '20000000-0000-0000-0000-000000000001'),
  4::bigint,
  'revocation advances the optimistic-concurrency revision'
);

CREATE TEMP TABLE membership_authority_tap_finish (failure text);
INSERT INTO membership_authority_tap_finish SELECT * FROM finish();
DO $tap_plan_must_match$
BEGIN
  IF EXISTS (SELECT 1 FROM membership_authority_tap_finish) THEN
    RAISE EXCEPTION 'pgTAP plan failed: %',
      (SELECT pg_catalog.string_agg(failure, E'\n') FROM membership_authority_tap_finish);
  END IF;
END;
$tap_plan_must_match$;

ROLLBACK;
