BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(13);

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
  'authenticated browser users cannot grant or reactivate membership'
);
SELECT ok(
  NOT has_function_privilege(
    'authenticated',
    'public.financemeta_set_membership_status(uuid,text,uuid)',
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
  'service role owns the bounded membership grant path'
);
SELECT ok(
  has_function_privilege(
    'service_role',
    'public.financemeta_set_membership_status(uuid,text,uuid)',
    'execute'
  ),
  'service role owns the bounded membership status path'
);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'membership-test@example.test', '',
  pg_catalog.now(), '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Membership Test"}'::jsonb,
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
  $$SELECT public.financemeta_set_membership_status(
    '20000000-0000-0000-0000-000000000001',
    'active',
    '20000000-0000-0000-0000-000000000001'
  )$$,
  '22023',
  'status changes must suspend or revoke membership',
  'status mutation cannot reactivate membership without the provenance-bearing grant path'
);
SELECT lives_ok(
  $$SELECT public.financemeta_set_membership_status(
    '20000000-0000-0000-0000-000000000001',
    'suspended',
    '20000000-0000-0000-0000-000000000001'
  )$$,
  'service role can suspend an existing membership'
);
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT ok(
  NOT public.financemeta_is_member(),
  'suspended membership fails the active-member predicate'
);
RESET ROLE;

SET LOCAL ROLE service_role;
SELECT throws_ok(
  $$SELECT public.financemeta_grant_membership(
    '20000000-0000-0000-0000-000000000001',
    '   ',
    '20000000-0000-0000-0000-000000000001'
  )$$,
  '22023',
  'membership source must be between 1 and 120 characters',
  'activation fails closed without bounded enrollment provenance'
);
SELECT lives_ok(
  $$SELECT public.financemeta_grant_membership(
    '20000000-0000-0000-0000-000000000001',
    'test:controlled-reactivation',
    '20000000-0000-0000-0000-000000000001'
  )$$,
  'reactivation must return through the explicit provenance-bearing grant path'
);
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT ok(
  public.financemeta_is_member(),
  'explicit reactivation restores the active-member predicate'
);
RESET ROLE;

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
