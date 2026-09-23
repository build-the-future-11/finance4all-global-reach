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

test('database authorization verifies the exact checked-out source before certification', () => {
  const source = readWorkflow('.github/workflows/ci.yml');
  const start = source.indexOf('\n  database-authorization:\n');
  const end = source.indexOf('\n  verify:\n');
  assert.notEqual(start, -1, 'CI must declare the database-authorization job');
  assert.notEqual(end, -1, 'CI must declare the verify job');
  assert.ok(end > start, 'database-authorization must precede verify');
  const databaseAuthorization = source.slice(start, end);

  assert.match(databaseAuthorization, /EXPECTED_SOURCE_SHA:\s*\$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
  assert.match(databaseAuthorization, /ref:\s*\$\{\{ env\.EXPECTED_SOURCE_SHA \}\}/);
  assert.match(databaseAuthorization, /name: Verify exact database authorization source binding/);
  assert.match(databaseAuthorization, /actual="\$\(git rev-parse HEAD\)"/);
  assert.match(databaseAuthorization, /test "\$actual" = "\$EXPECTED_SOURCE_SHA"/);
});

test('database authorization retains source- and workflow-bound certification evidence', () => {
  const source = readWorkflow('.github/workflows/ci.yml');
  const start = source.indexOf('\n  database-authorization:\n');
  const end = source.indexOf('\n  verify:\n');
  assert.notEqual(start, -1, 'CI must declare the database-authorization job');
  assert.notEqual(end, -1, 'CI must declare the verify job');
  const databaseAuthorization = source.slice(start, end);

  assert.match(databaseAuthorization, /name: Record database authorization provenance/);
  assert.match(databaseAuthorization, /printf 'source_sha=%s\\n' "\$EXPECTED_SOURCE_SHA"/);
  assert.match(databaseAuthorization, /printf 'event_sha=%s\\n' "\$GITHUB_SHA"/);
  assert.match(databaseAuthorization, /printf 'workflow_sha=%s\\n' "\$GITHUB_WORKFLOW_SHA"/);
  assert.match(databaseAuthorization, /printf 'workflow_ref=%s\\n' "\$GITHUB_WORKFLOW_REF"/);
  assert.match(databaseAuthorization, /sha256sum \.github\/workflows\/ci\.yml/);
  assert.match(databaseAuthorization, /find supabase\/migrations .*sha256sum/);
  assert.match(databaseAuthorization, /sha256sum supabase\/tests\/two_identity_rls_certification\.sql/);
  assert.match(databaseAuthorization, /sha256sum supabase\/tests\/account_lifecycle_rls_certification\.sql/);
  assert.match(databaseAuthorization, /2>&1 \| tee "\$evidence_dir\/certification\.log"/);
  assert.match(databaseAuthorization, /name: Upload database authorization evidence/);
  assert.match(databaseAuthorization, /name: database-authorization-\$\{\{ env\.EXPECTED_SOURCE_SHA \}\}/);
  assert.match(databaseAuthorization, /if-no-files-found: error/);
});

test('required verify gate fails closed unless database authorization succeeds', () => {
  const source = readWorkflow('.github/workflows/ci.yml');
  const marker = '\n  verify:\n';
  const index = source.indexOf(marker);
  assert.notEqual(index, -1, 'CI must declare the verify job');
  const verify = source.slice(index);

  assert.match(verify, /\n    needs: database-authorization\n/);
  assert.match(verify, /\n    if: always\(\)\n/);
  assert.match(verify, /name: Require database authorization/);
  assert.match(verify, /needs\.database-authorization\.result/);
  assert.match(verify, /test '\$\{\{ needs\.database-authorization\.result \}\}' = 'success'/);
});

test('application CI provenance distinguishes event and workflow source identities', () => {
  const source = readWorkflow('.github/workflows/ci.yml');
  const marker = '\n  verify:\n';
  const index = source.indexOf(marker);
  assert.notEqual(index, -1, 'CI must declare the verify job');
  const verify = source.slice(index);

  assert.match(verify, /printf 'source_sha=%s\\n' "\$EXPECTED_SOURCE_SHA"/);
  assert.match(verify, /printf 'event_sha=%s\\n' "\$GITHUB_SHA"/);
  assert.match(verify, /printf 'workflow_sha=%s\\n' "\$GITHUB_WORKFLOW_SHA"/);
  assert.match(verify, /printf 'workflow_ref=%s\\n' "\$GITHUB_WORKFLOW_REF"/);
  assert.match(verify, /printf 'workflow_sha256='/);
  assert.match(verify, /sha256sum \.github\/workflows\/ci\.yml \| awk/);
  assert.doesNotMatch(verify, /printf 'workflow_sha=%s\\n' "\$GITHUB_SHA"/);
});

test('database authorization digest-pins and records the resolved Postgres service image', () => {
  const source = readWorkflow('.github/workflows/ci.yml');
  const start = source.indexOf('\n  database-authorization:\n');
  const end = source.indexOf('\n  verify:\n');
  assert.notEqual(start, -1, 'CI must declare the database-authorization job');
  assert.notEqual(end, -1, 'CI must declare the verify job');
  const databaseAuthorization = source.slice(start, end);

  const digestRef = /public\.ecr\.aws\/supabase\/postgres@sha256:[0-9a-f]{64}/i;
  assert.match(databaseAuthorization, /EXPECTED_POSTGRES_IMAGE_REF:\s*public\.ecr\.aws\/supabase\/postgres@sha256:[0-9a-f]{64}/i);
  assert.match(databaseAuthorization, /image:\s*public\.ecr\.aws\/supabase\/postgres@sha256:[0-9a-f]{64}/i);
  assert.ok((databaseAuthorization.match(new RegExp(digestRef.source, 'gi')) ?? []).length >= 2);
  assert.doesNotMatch(databaseAuthorization, /image:\s*public\.ecr\.aws\/supabase\/postgres:[^@\s]+/i);
  assert.match(databaseAuthorization, /name: Record resolved database service image/);
  assert.match(databaseAuthorization, /docker inspect --format '\{\{\.Image\}\}'/);
  assert.match(databaseAuthorization, /docker image inspect "\$image_id" --format '\{\{json \.RepoDigests\}\}'/);
  assert.match(databaseAuthorization, /expected_digest="\$\{EXPECTED_POSTGRES_IMAGE_REF##@\}"/);
  assert.match(databaseAuthorization, /grep -Fq "@\$\{expected_digest\}"/);
  assert.match(databaseAuthorization, /docker exec "\$POSTGRES_CONTAINER" postgres --version/);
  assert.match(databaseAuthorization, /printf 'configured_postgres_image=%s\\n' "\$EXPECTED_POSTGRES_IMAGE_REF"/);
  assert.match(databaseAuthorization, /printf 'resolved_postgres_repo_digests=%s\\n' "\$repo_digests"/);
  assert.match(databaseAuthorization, /printf 'resolved_postgres_matches_configured=true\\n'/);
});
