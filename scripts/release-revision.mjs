import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

const REVISION_PATTERN = /^[0-9a-f]{40}$/;

export function normalizeVercelConfig({
  env = process.env,
  gitHead = readGitHead,
  committed = () => execFileSync("git", ["show", "HEAD:vercel.json"], { encoding: "utf8" }),
  working = () => readFileSync("vercel.json", "utf8"),
  restore = (text) => writeFileSync("vercel.json", text, "utf8"),
} = {}) {
  if (env.VERCEL !== "1") return;
  if (validateReleaseRevision(env.VERCEL_GIT_COMMIT_SHA, "VERCEL_GIT_COMMIT_SHA") !== gitHead()) {
    throw new Error("Vercel source revision differs from checked-out HEAD");
  }
  const original = committed();
  const current = working();
  if (original === current) return;
  const expected = JSON.parse(original);
  const actual = JSON.parse(current);
  if (!isDeepStrictEqual(expected, actual)) {
    const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])]
      .filter((key) => !isDeepStrictEqual(expected[key], actual[key]));
    throw new Error(`Vercel changed configuration values; refusing release. Changed keys: ${JSON.stringify(keys)}`);
  }
  // Restore only formatting/key-order changes, then require byte-clean Git status.
  restore(original);
}

export function assertCleanReleaseSource({ status = () => execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], { encoding: "utf8" }) } = {}) {
  const changes = status().trim();
  if (changes) throw new Error(`Release build requires a clean source checkout; commit or preserve pending work before building a release. Changed paths: ${JSON.stringify(changes)}`);
}

export function validateReleaseRevision(value, label = "release revision") {
  const revision = String(value ?? "").trim();
  if (!REVISION_PATTERN.test(revision)) {
    throw new Error(`${label} must be an immutable lowercase 40-character Git SHA`);
  }
  return revision;
}

function readGitHead() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function resolveReleaseRevision({ env = process.env, gitHead = readGitHead } = {}) {
  const sourceSha = String(env.SOURCE_SHA ?? "").trim()
    ? validateReleaseRevision(env.SOURCE_SHA, "SOURCE_SHA")
    : null;
  const vercelSha = String(env.VERCEL_GIT_COMMIT_SHA ?? "").trim()
    ? validateReleaseRevision(env.VERCEL_GIT_COMMIT_SHA, "VERCEL_GIT_COMMIT_SHA")
    : null;

  if (sourceSha && vercelSha && sourceSha !== vercelSha) {
    throw new Error("release revision environment disagrees");
  }
  if (sourceSha) return sourceSha;
  if (vercelSha) return vercelSha;

  if (String(env.GITHUB_SHA ?? "").trim()) {
    return validateReleaseRevision(env.GITHUB_SHA, "GITHUB_SHA");
  }
  return validateReleaseRevision(gitHead(), "git HEAD");
}
