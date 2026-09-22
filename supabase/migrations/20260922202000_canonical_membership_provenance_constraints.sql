-- Align storage-level FinanceMeta membership provenance invariants with the
-- canonicalization performed by the server-owned mutation functions.
--
-- Browser roles still have no direct access to the private authority table, but
-- privileged/direct writes must also fail closed rather than persisting leading
-- or trailing POSIX whitespace that the service API itself would normalize.

BEGIN;

ALTER TABLE private.financemeta_memberships
  ADD CONSTRAINT financemeta_memberships_source_canonical_check
    CHECK (
      pg_catalog.char_length(source) BETWEEN 1 AND 120
      AND source = pg_catalog.regexp_replace(
        source,
        '^[[:space:]]+|[[:space:]]+$',
        '',
        'g'
      )
    ),
  ADD CONSTRAINT financemeta_memberships_last_activation_source_canonical_check
    CHECK (
      last_activation_source IS NULL
      OR (
        pg_catalog.char_length(last_activation_source) BETWEEN 1 AND 120
        AND last_activation_source = pg_catalog.regexp_replace(
          last_activation_source,
          '^[[:space:]]+|[[:space:]]+$',
          '',
          'g'
        )
      )
    );

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260922202000', 'canonical_membership_provenance_constraints')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
