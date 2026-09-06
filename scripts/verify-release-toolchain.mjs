#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';

const EXPECTED_PACKAGE_MANAGER = 'npm@10.9.8';
const EXPECTED_NODE_ENGINE = '>=20.0.0';
const FORBIDDEN_LOCKFILES = [
  'bun.lock',
  'bun.lockb',
  'pnpm-lock.yaml',
  'yarn.lock',
];

function fail(message) {
  throw new Error(`[release-toolchain] ${message}`);
}

export function verifyReleaseToolchain({
  packageJson = JSON.parse(readFileSync('package.json', 'utf8')),
  exists = existsSync,
  nodeVersion = process.versions.node,
  userAgent = process.env.npm_config_user_agent ?? '',
} = {}) {
  if (packageJson.packageManager !== EXPECTED_PACKAGE_MANAGER) {
    fail(`packageManager must be exactly ${EXPECTED_PACKAGE_MANAGER}`);
  }

  if (packageJson.engines?.node !== EXPECTED_NODE_ENGINE) {
    fail(`engines.node must be exactly ${EXPECTED_NODE_ENGINE}`);
  }

  if (!exists('package-lock.json')) {
    fail('package-lock.json is required for the release path');
  }

  const conflicting = FORBIDDEN_LOCKFILES.filter((file) => exists(file));
  if (conflicting.length > 0) {
    fail(`conflicting lockfiles are not allowed: ${conflicting.join(', ')}`);
  }

  const nodeMajor = Number.parseInt(String(nodeVersion).split('.')[0], 10);
  if (!Number.isInteger(nodeMajor) || nodeMajor < 20) {
    fail(`Node >=20 is required; observed ${nodeVersion}`);
  }

  if (userAgent && !userAgent.startsWith('npm/')) {
    fail(`release scripts must run under npm; observed ${userAgent}`);
  }

  return {
    packageManager: packageJson.packageManager,
    nodeEngine: packageJson.engines.node,
    nodeVersion,
  };
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const result = verifyReleaseToolchain();
    console.log(`[release-toolchain] verified ${result.packageManager}, Node ${result.nodeVersion}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
