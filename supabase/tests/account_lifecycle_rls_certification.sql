BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(23);

SELECT ok(
  NOT has_table_privilege('anon', 'public.account_deletion_requests', 'select'),
  'anonymous clients cannot read deletion requests'
);
SELECT ok(
  NOT has_function_privilege('anon', 'public.request_account_deletion(text)', 'execute'),
  'anonymous clients cannot request deletion'
);
SELECT ok(
  NOT has_function_privilege('anon', 'public.export_my_data()', 'execute'),
  'anonymous clients cannot export member data'
);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'member-a@example.test', '',
    pg_catalog.now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Member A"}'::jsonb, pg_catalog.now(), pg_catalog.now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'member-b@example.test', '',
    pg_catalog.now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Member B"}'::jsonb, pg_catalog.now(), pg_catalog.now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'admin@example.test', '',
    pg_catalog.now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Admin"}'::jsonb, pg_catalog.now(), pg_catalog.now()
  );

UPDATE public.profiles
SET role = 'admin'::public.user_role
WHERE id = '10000000-0000-0000-0000-000000000003';

SET LOCAL ROLE authenticated;
SELECT pg_catalog.set_config('request.jwt.claim.role', 'authenticated', true);
SELECT pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
SELECT pg_catalog.set_config('request.jwt.claim.email', 'member-a@example.test', true);

SELECT ok(
  has_table_privilege('authenticated', 'public.account_deletion_requests', 'select'),
  'authenticated members have the select grant needed by PostgREST'
);
SELECT ok(
  NOT has_table_privilege('authenticated', 'public.account_deletion_requests', 'insert'),
  'members cannot bypass the deletion request RPC'
);
SELECT lives_ok(
  $$SELECT public.request_account_deletion('Please remove my account')$$,
  'member A can create their own request through the RPC'
);
SELECT is(
  (SELECT status FROM public.account_deletion_requests),
  'pending',
  'a new request starts pending'
);
SELECT is(
  (SELECT pg_catalog.count(*) FROM public.account_deletion_requests),
  1::bigint,
  'member A sees only their own request'
);
SELECT is(
  (public.export_my_data() -> 'profile' ->> 'id'),
  '10000000-0000-0000-0000-000000000001',
  'member export is bound to auth.uid()'
);
SELECT is(
  pg_catalog.jsonb_array_length(public.export_my_data() -> 'notifications'),
  0,
  'member export represents absent collections as arrays'
);

DO $member_cannot_review$
DECLARE
  affected integer;
BEGIN
  UPDATE public.account_deletion_requests SET status = 'in_progress';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'ordinary member reviewed their own deletion request';
  END IF;
END;
$member_cannot_review$;
SELECT pass('ordinary members cannot review deletion requests');

SELECT lives_ok(
  $$SELECT public.cancel_account_deletion()$$,
  'member A can cancel a pending request'
);
SELECT is(
  (SELECT status FROM public.account_deletion_requests),
  'cancelled',
  'cancellation is visible to the requesting member'
);
SELECT lives_ok(
  $$SELECT public.request_account_deletion('Resubmitted request')$$,
  'member A can resubmit a cancelled request'
);
SELECT ok(
  (SELECT status = 'pending' AND reviewed_at IS NULL AND reviewed_by IS NULL
   FROM public.account_deletion_requests),
  'resubmission clears review metadata without naming the member as reviewer'
);

SELECT pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
SELECT pg_catalog.set_config('request.jwt.claim.email', 'member-b@example.test', true);
SELECT lives_ok(
  $$SELECT public.request_account_deletion(NULL)$$,
  'member B can independently request deletion'
);
SELECT is(
  (SELECT pg_catalog.count(*) FROM public.account_deletion_requests),
  1::bigint,
  'member B cannot see member A request data'
);

SELECT pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
SELECT pg_catalog.set_config('request.jwt.claim.email', 'admin@example.test', true);
SELECT is(
  (SELECT pg_catalog.count(*) FROM public.account_deletion_requests),
  2::bigint,
  'an admin can review the complete request queue'
);
SELECT lives_ok(
  $$UPDATE public.account_deletion_requests
    SET status = 'in_progress', review_note = 'Identity confirmed'
    WHERE user_id = '10000000-0000-0000-0000-000000000002'$$,
  'an admin can move a request into review'
);
SELECT is(
  (SELECT reviewed_by::text FROM public.account_deletion_requests
   WHERE user_id = '10000000-0000-0000-0000-000000000002'),
  '10000000-0000-0000-0000-000000000003',
  'the database records the reviewing admin identity'
);

SELECT pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
SELECT is(
  (SELECT status FROM public.account_deletion_requests),
  'in_progress',
  'member B can read the reviewed state of their request'
);
SELECT throws_ok(
  $$SELECT public.cancel_account_deletion()$$,
  'P0002',
  'no pending deletion request found',
  'a request already in review cannot be cancelled by the member'
);
SELECT throws_ok(
  $$SELECT public.request_account_deletion('attempt to bypass review')$$,
  'P0001',
  'deletion request is already in review',
  'a member cannot reset a request already in admin review'
);

RESET ROLE;
CREATE TEMP TABLE account_lifecycle_tap_finish (failure text);
INSERT INTO account_lifecycle_tap_finish SELECT * FROM finish();
DO $tap_plan_must_match$
BEGIN
  IF EXISTS (SELECT 1 FROM account_lifecycle_tap_finish) THEN
    RAISE EXCEPTION 'pgTAP plan failed: %',
      (SELECT pg_catalog.string_agg(failure, E'\n') FROM account_lifecycle_tap_finish);
  END IF;
END;
$tap_plan_must_match$;
ROLLBACK;
