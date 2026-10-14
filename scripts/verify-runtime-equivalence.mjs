#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const REVISION = /^[0-9a-f]{40}$/;

// Compare every tracked path conservatively. Tailwind's automatic source
// detection consumes text outside application imports, including documentation
// and tests. Excluding those paths can certify changed CSS inputs as equivalent;
// an application-only allowlist also misses new build helpers and configuration.

function fail(message) {
  throw new Error(`[runtime-equivalence] ${message}`);
}

function requireCommit(revision, label, cwd) {
  if (typeof revision !== 'string' || !REVISION.test(revision)) {
    fail(`${label} must be an immutable lowercase 40-character Git SHA`);
  }
  let resolved;
  try {
    resolved = execFileSync('git', ['rev-parse', '--verify', `${revision}^{commit}`], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    fail(`${label} is not available as a commit in this checkout`);
  }
  if (resolved !== revision) fail(`${label} did not resolve to the exact requested commit`);
}

export function verifyRuntimeEquivalence({
  deployedRevision,
  sourceRevision,
  cwd = process.cwd(),
} = {}) {
  requireCommit(deployedRevision, 'deployed revision', cwd);
  requireCommit(sourceRevision, 'source revision', cwd);

  let changed;
  try {
    changed = execFileSync('git', [
      'diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--no-relative', '--name-only', '-z',
      deployedRevision, sourceRevision, '--', ':(top)',
    ], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    fail('could not compare the two committed input trees');
  }

  const changedPaths = changed.split('\0').filter(Boolean);
  return {
    schema: 'financemeta.runtime-equivalence.v1',
    deployedRevision,
    sourceRevision,
    runtimeEquivalent: changedPaths.length === 0,
    changedPaths,
    excludedPaths: [],
    scope: 'All committed paths, conservatively including documentation and tests consumed by source scanning. Hosted environment, provider state, database state, and output bytes require separate evidence.',
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { values } = parseArgs({
      options: {
        'deployed-revision': { type: 'string' },
        'source-revision': { type: 'string' },
        receipt: { type: 'string' },
      },
    });
    const receipt = verifyRuntimeEquivalence({
      deployedRevision: values['deployed-revision'],
      sourceRevision: values['source-revision'],
    });
    const output = `${JSON.stringify(receipt, null, 2)}\n`;
    if (values.receipt) writeFileSync(resolve(values.receipt), output, 'utf8');
    process.stdout.write(output);
    process.exitCode = receipt.runtimeEquivalent ? 0 : 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
