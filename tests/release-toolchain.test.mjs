import test from 'node:test';
import assert from 'node:assert/strict';

import { verifyReleaseToolchain } from '../scripts/verify-release-toolchain.mjs';

const packageJson = {
  packageManager: 'npm@10.9.8',
  engines: { node: '>=20.0.0' },
};

function existsFrom(files) {
  const set = new Set(files);
  return (file) => set.has(file);
}

test('accepts the single npm release contract on Node 20+', () => {
  const result = verifyReleaseToolchain({
    packageJson,
    exists: existsFrom(['package-lock.json']),
    nodeVersion: '22.23.2',
    userAgent: 'npm/10.9.8 node/v22.23.2 linux x64 workspaces/false',
  });

  assert.equal(result.packageManager, 'npm@10.9.8');
});

test('rejects package-manager declaration drift', () => {
  assert.throws(
    () => verifyReleaseToolchain({
      packageJson: { ...packageJson, packageManager: 'bun@1.2.0' },
      exists: existsFrom(['package-lock.json']),
      nodeVersion: '22.23.2',
      userAgent: 'npm/10.9.8',
    }),
    /packageManager must be exactly npm@10\.9\.8/,
  );
});

test('rejects Node engine floor drift', () => {
  assert.throws(
    () => verifyReleaseToolchain({
      packageJson: { ...packageJson, engines: { node: '>=18' } },
      exists: existsFrom(['package-lock.json']),
      nodeVersion: '22.23.2',
      userAgent: 'npm/10.9.8',
    }),
    /engines\.node must be exactly >=20\.0\.0/,
  );
});

test('rejects missing npm lockfile and conflicting lockfiles', () => {
  assert.throws(
    () => verifyReleaseToolchain({
      packageJson,
      exists: existsFrom([]),
      nodeVersion: '22.23.2',
      userAgent: 'npm/10.9.8',
    }),
    /package-lock\.json is required/,
  );

  for (const lockfile of ['bun.lock', 'bun.lockb', 'pnpm-lock.yaml', 'yarn.lock']) {
    assert.throws(
      () => verifyReleaseToolchain({
        packageJson,
        exists: existsFrom(['package-lock.json', lockfile]),
        nodeVersion: '22.23.2',
        userAgent: 'npm/10.9.8',
      }),
      new RegExp(`conflicting lockfiles are not allowed: ${lockfile.replace('.', '\\.')}`),
    );
  }
});

test('rejects runtime execution below Node 20', () => {
  assert.throws(
    () => verifyReleaseToolchain({
      packageJson,
      exists: existsFrom(['package-lock.json']),
      nodeVersion: '18.20.8',
      userAgent: 'npm/10.9.8',
    }),
    /Node >=20 is required/,
  );
});

test('rejects release scripts invoked through a non-npm package manager', () => {
  assert.throws(
    () => verifyReleaseToolchain({
      packageJson,
      exists: existsFrom(['package-lock.json']),
      nodeVersion: '22.23.2',
      userAgent: 'bun/1.2.0 npm/? node/v22.23.2',
    }),
    /release scripts must run under npm/,
  );
});
