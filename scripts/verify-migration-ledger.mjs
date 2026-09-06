#!/usr/bin/env node

import { readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const TIMESTAMPED_MIGRATION = /^(\d{14})_[A-Za-z0-9][A-Za-z0-9_-]*\.sql$/;
const VERSION = /^\d{14}$/;

function fail(message) {
  throw new Error(`[migration-ledger] ${message}`);
}

export function repositoryMigrationVersions({
  migrationDir = 'supabase/migrations',
  entries = readdirSync(migrationDir, { withFileTypes: true }),
} = {}) {
  const versions = [];
  const seen = new Set();

  for (const entry of entries) {
    if (entry?.isFile && !entry.isFile()) continue;
    const name = typeof entry === 'string' ? entry : entry.name;
    const match = TIMESTAMPED_MIGRATION.exec(name);
    if (!match) continue;

    const version = match[1];
    if (seen.has(version)) fail(`duplicate repository migration version ${version}`);
    seen.add(version);
    versions.push(version);
  }

  versions.sort();
  if (versions.length === 0) fail('no timestamped repository migrations found');
  return versions;
}

export function parseProductionVersions(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    fail('production migration versions are required');
  }

  const tokens = raw
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) fail('production migration versions are required');

  const versions = [];
  const seen = new Set();
  for (const token of tokens) {
    if (!VERSION.test(token)) fail(`invalid production migration version ${token}`);
    if (seen.has(token)) fail(`duplicate production migration version ${token}`);
    seen.add(token);
    versions.push(token);
  }

  versions.sort();
  return versions;
}

export function verifyMigrationLedger({ repositoryVersions, productionVersions }) {
  if (!Array.isArray(repositoryVersions) || repositoryVersions.length === 0) {
    fail('repository migration versions are required');
  }
  if (!Array.isArray(productionVersions) || productionVersions.length === 0) {
    fail('production migration versions are required');
  }

  const repository = [...repositoryVersions].sort();
  const production = [...productionVersions].sort();
  const repositorySet = new Set(repository);
  const productionSet = new Set(production);

  const missingInProduction = repository.filter((version) => !productionSet.has(version));
  const missingInRepository = production.filter((version) => !repositorySet.has(version));

  if (missingInProduction.length > 0 || missingInRepository.length > 0) {
    const parts = [];
    if (missingInProduction.length > 0) {
      parts.push(`repository-only versions: ${missingInProduction.join(', ')}`);
    }
    if (missingInRepository.length > 0) {
      parts.push(`production-only versions: ${missingInRepository.join(', ')}`);
    }
    fail(`migration ledger drift detected (${parts.join('; ')})`);
  }

  const repositoryLatest = repository.at(-1);
  const productionLatest = production.at(-1);
  if (repositoryLatest !== productionLatest) {
    fail(`latest migration mismatch: repository=${repositoryLatest} production=${productionLatest}`);
  }

  return {
    status: 'MATCH',
    repositoryVersions: repository,
    productionVersions: production,
    latestVersion: repositoryLatest,
  };
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const rawProductionVersions =
      argumentValue('--production-versions') ?? process.env.PRODUCTION_MIGRATION_VERSIONS ?? '';
    const receiptPath = argumentValue('--receipt');
    const repositoryVersions = repositoryMigrationVersions();
    const productionVersions = parseProductionVersions(rawProductionVersions);
    const result = verifyMigrationLedger({ repositoryVersions, productionVersions });

    const receipt = {
      schema: 'financemeta.migration-ledger-certification.v1',
      sourceSha: process.env.EXPECTED_SOURCE_SHA || process.env.GITHUB_SHA || null,
      ...result,
    };

    if (receiptPath) {
      writeFileSync(resolve(receiptPath), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
    }

    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
