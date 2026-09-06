import { execFileSync } from "node:child_process";

const REVISION_PATTERN = /^[0-9a-f]{40}$/;

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
