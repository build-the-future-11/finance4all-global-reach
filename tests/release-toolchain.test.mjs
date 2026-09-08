import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { verifyReleaseToolchain } from '../scripts/verify-release-toolchain.mjs';

for (const family of ['rolldown', 'lightningcss', 'supabase']) {
test(`lockfile retains every ${family} platform binding for clean cross-platform installs`, () => {
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  const parent = lock.packages[`node_modules/${family}`];
  assert.ok(parent, `${family} must be locked`);
  const bindings = Object.entries(parent.optionalDependencies ?? {});
  assert.ok(bindings.some(([name]) => name.includes('linux-x64')));
  for (const [name, version] of bindings) {
    const binding = lock.packages[`node_modules/${name}`];
    assert.ok(binding, `Missing cross-platform binding: ${name}`);
    assert.equal(binding.version, version, `Mismatched binding: ${name}`);
    assert.ok(binding.integrity, `Missing registry integrity: ${name}`);
  }
});
}

const packageJson = {
  packageManager: 'npm@10.9.8',
  engines: { node: '>=22.12.0' },
};

test('CI audit artifacts stay outside the release source checkout', () => {
  const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  assert.ok(workflow.includes('${{ runner.temp }}/portal-ci-evidence'));
  for (const line of workflow.split('\n').filter((line) => line.includes('ci-evidence'))) {
    assert.ok(line.includes('${{ runner.temp }}/portal-ci-evidence'), line);
  }
});

test('Vercel installs the lockfile without rewriting release inputs', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.installCommand, 'npm ci --no-audit --fund=false');
});

function existsFrom(files) {
  const set = new Set(files);
  return (file) => set.has(file);
}

test('accepts the single npm release contract on Node 22.12+', () => {
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
      packageJson: { ...packageJson, engines: { node: '>=20.0.0' } },
      exists: existsFrom(['package-lock.json']),
      nodeVersion: '22.23.2',
      userAgent: 'npm/10.9.8',
    }),
    /engines\.node must be exactly >=22\.12\.0/,
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

test('rejects runtime execution below Node 22.12', () => {
  for (const nodeVersion of ['20.19.6', '22.11.0']) {
    assert.throws(
      () => verifyReleaseToolchain({
        packageJson,
        exists: existsFrom(['package-lock.json']),
        nodeVersion,
        userAgent: 'npm/10.9.8',
      }),
      /Node >=22\.12 is required/,
    );
  }
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
