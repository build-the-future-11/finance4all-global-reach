import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_SERVICE = "finance4all-global-reach";
const SHA_RE = /^[0-9a-f]{40}$/;

export function validateRevision(value, label = "revision") {
  if (typeof value !== "string" || !SHA_RE.test(value)) {
    throw new Error(`${label} must be a 40-character lowercase Git SHA`);
  }
  return value;
}

export function resolveReleaseRevision({ env = process.env, gitHeadFn } = {}) {
  const declared = [
    ["EXPECTED_SOURCE_SHA", env.EXPECTED_SOURCE_SHA],
    ["SOURCE_SHA", env.SOURCE_SHA],
    ["VERCEL_GIT_COMMIT_SHA", env.VERCEL_GIT_COMMIT_SHA],
  ]
    .filter(([, value]) => typeof value === "string" && value.trim() !== "")
    .map(([name, value]) => [name, validateRevision(value.trim(), name)]);

  const unique = new Set(declared.map(([, value]) => value));
  if (unique.size > 1) {
    throw new Error(
      `release revision inputs disagree: ${declared.map(([name, value]) => `${name}=${value}`).join(", ")}`,
    );
  }
  if (declared.length > 0) {
    return declared[0][1];
  }

  const readGitHead =
    gitHeadFn ??
    (() => execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim());
  return validateRevision(readGitHead(), "git HEAD");
}

export function makeReleaseRevision(revision) {
  return {
    service: EXPECTED_SERVICE,
    revision: validateRevision(revision),
  };
}

export function writeReleaseRevision({ outDir = "dist", revision } = {}) {
  const exactRevision = revision ?? resolveReleaseRevision();
  const payload = makeReleaseRevision(exactRevision);
  mkdirSync(outDir, { recursive: true });
  const outputPath = path.join(outDir, "release-revision.json");
  writeFileSync(outputPath, `${JSON.stringify(payload)}\n`, "utf8");
  return { outputPath, payload };
}

export function verifyReleaseRevisionFile(filePath, expectedRevision) {
  const expected = makeReleaseRevision(expectedRevision);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    throw new Error("release revision artifact must be valid JSON");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("release revision artifact must be a JSON object");
  }

  const keys = Object.keys(parsed).sort();
  if (keys.length !== 2 || keys[0] !== "revision" || keys[1] !== "service") {
    throw new Error("release revision artifact must contain only service and revision");
  }
  if (parsed.service !== expected.service) {
    throw new Error(`release revision service mismatch: expected ${expected.service}`);
  }
  if (parsed.revision !== expected.revision) {
    throw new Error("release revision does not match expected source SHA");
  }

  return expected;
}

async function main() {
  const command = process.argv[2] ?? "write";
  if (command === "write") {
    const result = writeReleaseRevision();
    process.stdout.write(`${JSON.stringify(result.payload)}\n`);
    return;
  }
  if (command === "verify") {
    const expectedRevision = process.argv[3] ?? resolveReleaseRevision();
    const filePath = process.argv[4] ?? path.join("dist", "release-revision.json");
    const result = verifyReleaseRevisionFile(filePath, expectedRevision);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  throw new Error(`unsupported release-revision command: ${command}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[release-revision] ${message}\n`);
    process.exitCode = 1;
  });
}
