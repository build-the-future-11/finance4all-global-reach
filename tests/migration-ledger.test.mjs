import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseProductionVersions,
  repositoryMigrationVersions,
  verifyMigrationLedger,
} from '../scripts/verify-migration-ledger.mjs';

function file(name) {
  return { name, isFile: () => true };
}

test('extracts and sorts timestamped repository migration versions only', () => {
  const versions = repositoryMigrationVersions({
    entries: [
      file('004_authorization_hardening.sql'),
      file('20260906150000_retire_unused_hosted_extensions.sql'),
      file('001_initial_schema.sql'),
      file('20260906121145_portal_security_and_privacy.sql'),
      file('README.md'),
    ],
  });

  assert.deepEqual(versions, ['20260906121145', '20260906150000']);
});

test('rejects duplicate timestamped repository versions', () => {
  assert.throws(
    () => repositoryMigrationVersions({
      entries: [
        file('20260906121145_first.sql'),
        file('20260906121145_second.sql'),
      ],
    }),
    /duplicate repository migration version 20260906121145/,
  );
});

test('parses a production ledger from comma or whitespace separated versions', () => {
  assert.deepEqual(
    parseProductionVersions('20260906150000, 20260906121145\n20260904012631'),
    ['20260904012631', '20260906121145', '20260906150000'],
  );
});

test('rejects malformed and duplicate production ledger versions', () => {
  assert.throws(
    () => parseProductionVersions('20260906121145 not-a-version'),
    /invalid production migration version not-a-version/,
  );
  assert.throws(
    () => parseProductionVersions('20260906121145 20260906121145'),
    /duplicate production migration version 20260906121145/,
  );
});

test('accepts exact repository and production timestamp history equivalence', () => {
  const result = verifyMigrationLedger({
    repositoryVersions: ['20260906121145', '20260906150000'],
    productionVersions: ['20260906150000', '20260906121145'],
  });

  assert.equal(result.status, 'MATCH');
  assert.equal(result.latestVersion, '20260906150000');
});

test('fails closed when repository migrations are missing from production ledger', () => {
  assert.throws(
    () => verifyMigrationLedger({
      repositoryVersions: ['20260906121145', '20260906150000'],
      productionVersions: ['20260906121145'],
    }),
    /repository-only versions: 20260906150000/,
  );
});

test('fails closed when production ledger contains versions absent from repository history', () => {
  assert.throws(
    () => verifyMigrationLedger({
      repositoryVersions: ['20260906121145', '20260906150000'],
      productionVersions: ['20260904012631', '20260906121145', '20260906150000'],
    }),
    /production-only versions: 20260904012631/,
  );
});
