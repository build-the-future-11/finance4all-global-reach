BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(5);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  '21000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'membership-storage-test@example.test', '',
  pg_catalog.now(), '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Membership Storage Test"}'::jsonb,
  pg_catalog.now(), pg_catalog.now()
),
(
  '00000000-0000-0000-0000-000000000000',
  '21000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated', 'membership-storage-actor@example.test', '',
  pg_catalog.now(), '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Membership Storage Actor"}'::jsonb,
  pg_catalog.now(), pg_catalog.now()
);

SET LOCAL ROLE service_role;
SELECT lives_ok(
  $$SELECT public.financemeta_grant_membership(
    '21000000-0000-0000-0000-000000000001',
    'test:canonical-storage',
    '21000000-0000-0000-0000-000000000002'
  )$$,
  'service authority can create a canonical membership row before direct-write checks'
);
RESET ROLE;

SELECT throws_ok(
  $$UPDATE private.financemeta_memberships
    SET source = E'\tcorrupted-original-source'
    WHERE user_id = '21000000-0000-0000-0000-000000000001'$$,
  '23514',
  'new row for relation "financemeta_memberships" violates check constraint "financemeta_memberships_source_canonical_check"',
  'privileged direct writes cannot persist non-canonical original grant provenance'
);

SELECT throws_ok(
  $$UPDATE private.financemeta_memberships
    SET last_activation_source = E'corrupted-activation-source\n'
    WHERE user_id = '21000000-0000-0000-0000-000000000001'$$,
  '23514',
  'new row for relation "financemeta_memberships" violates check constraint "financemeta_memberships_last_activation_source_canonical_check"',
  'privileged direct writes cannot persist non-canonical activation provenance'
);

SELECT is(
  (SELECT source FROM private.financemeta_memberships
   WHERE user_id = '21000000-0000-0000-0000-000000000001'),
  'test:canonical-storage',
  'failed direct writes preserve canonical original grant provenance'
);

SELECT is(
  (SELECT last_activation_source FROM private.financemeta_memberships
   WHERE user_id = '21000000-0000-0000-0000-000000000001'),
  'test:canonical-storage',
  'failed direct writes preserve canonical activation provenance'
);

CREATE TEMP TABLE membership_provenance_storage_tap_finish (failure text);
INSERT INTO membership_provenance_storage_tap_finish SELECT * FROM finish();
DO $tap_plan_must_match$
BEGIN
  IF EXISTS (SELECT 1 FROM membership_provenance_storage_tap_finish) THEN
    RAISE EXCEPTION 'pgTAP plan failed: %',
      (SELECT pg_catalog.string_agg(failure, E'\n') FROM membership_provenance_storage_tap_finish);
  END IF;
END;
$tap_plan_must_match$;

ROLLBACK;
