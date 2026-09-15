import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const releaseCriticalWorkflows = [
  '.github/workflows/ci.yml',
  '.github/workflows/full-dependency-audit.yml',
  '.github/workflows/production-health.yml',
  '.github/workflows/production-auth-certification.yml',
  '.github/workflows/production-migration-ledger-certification.yml',
  '.github/workflows/production-rls-certification.yml',
];

function readWorkflow(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('release-critical workflows pin Ubuntu 24.04', () => {
  for (const path of releaseCriticalWorkflows) {
    const source = readWorkflow(path);
    const runnerLines = source.split('\n').filter((line) => /^\s*runs-on:/.test(line));

    assert.ok(runnerLines.length > 0, `${path} must declare at least one runner`);
    for (const line of runnerLines) {
      assert.match(line, /runs-on:\s*ubuntu-24\.04\s*$/, `${path} must pin Ubuntu 24.04`);
    }
    assert.doesNotMatch(source, /runs-on:\s*ubuntu-latest\b/, `${path} must not float on ubuntu-latest`);
  }
});

test('Node-based release workflows pin Node 22.23.2', () => {
  for (const path of releaseCriticalWorkflows) {
    const source = readWorkflow(path);
    if (!source.includes('actions/setup-node@')) continue;

    const versions = [...source.matchAll(/node-version:\s*['\"]?([^'\"\s#]+)['\"]?/g)].map((match) => match[1]);
    assert.ok(versions.length > 0, `${path} uses setup-node but declares no node-version`);
    for (const version of versions) {
      assert.equal(version, '22.23.2', `${path} must pin Node 22.23.2`);
    }
  }
});

test('remote GitHub Actions are immutable SHA-pinned', () => {
  for (const path of releaseCriticalWorkflows) {
    const source = readWorkflow(path);
    const usesLines = source.split('\n').filter((line) => /^\s*uses:/.test(line));

    for (const line of usesLines) {
      const match = line.match(/^\s*uses:\s*([^@\s]+)@([^\s#]+)/);
      if (!match) continue;
      const [, action, ref] = match;
      if (action.startsWith('./')) continue;
      assert.match(ref, /^[0-9a-f]{40}$/i, `${path} must SHA-pin ${action}`);
    }
  }
});
