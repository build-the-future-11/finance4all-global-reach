import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  makeReleaseRevision,
  resolveReleaseRevision,
  validateRevision,
  verifyReleaseRevisionFile,
  writeReleaseRevision,
} from "./release-revision.mjs";

const SHA_A = "1111111111111111111111111111111111111111";
const SHA_B = "2222222222222222222222222222222222222222";

test("validateRevision accepts only exact lowercase 40-character SHAs", () => {
  assert.equal(validateRevision(SHA_A), SHA_A);
  for (const invalid of [
    "1111111",
    `${SHA_A}0`,
    SHA_A.toUpperCase().replaceAll("1", "A"),
    "main",
    "",
  ]) {
    assert.throws(() => validateRevision(invalid), /40-character lowercase Git SHA/);
  }
});

test("resolveReleaseRevision prefers explicit exact identity and rejects disagreement", () => {
  assert.equal(
    resolveReleaseRevision({ env: { EXPECTED_SOURCE_SHA: SHA_A, VERCEL_GIT_COMMIT_SHA: SHA_A } }),
    SHA_A,
  );
  assert.throws(
    () =>
      resolveReleaseRevision({ env: { EXPECTED_SOURCE_SHA: SHA_A, VERCEL_GIT_COMMIT_SHA: SHA_B } }),
    /inputs disagree/,
  );
});

test("resolveReleaseRevision falls back to exact git HEAD when release env is absent", () => {
  assert.equal(resolveReleaseRevision({ env: {}, gitHeadFn: () => SHA_B }), SHA_B);
});

test("writeReleaseRevision creates a minimal deterministic source identity artifact", () => {
  const outDir = mkdtempSync(path.join(os.tmpdir(), "finance4all-release-"));
  const { outputPath, payload } = writeReleaseRevision({ outDir, revision: SHA_A });
  assert.deepEqual(payload, makeReleaseRevision(SHA_A));
  assert.equal(
    readFileSync(outputPath, "utf8"),
    '{"service":"finance4all-global-reach","revision":"1111111111111111111111111111111111111111"}\n',
  );
});

test("verifyReleaseRevisionFile fails closed on service, revision, or schema drift", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "finance4all-release-verify-"));
  const file = path.join(dir, "release-revision.json");

  writeFileSync(file, `${JSON.stringify(makeReleaseRevision(SHA_A))}\n`, "utf8");
  assert.deepEqual(verifyReleaseRevisionFile(file, SHA_A), makeReleaseRevision(SHA_A));

  writeFileSync(file, `${JSON.stringify({ service: "wrong", revision: SHA_A })}\n`, "utf8");
  assert.throws(() => verifyReleaseRevisionFile(file, SHA_A), /service mismatch/);

  writeFileSync(file, `${JSON.stringify({ service: "finance4all-global-reach", revision: SHA_B })}\n`, "utf8");
  assert.throws(() => verifyReleaseRevisionFile(file, SHA_A), /does not match expected source SHA/);

  writeFileSync(
    file,
    `${JSON.stringify({ service: "finance4all-global-reach", revision: SHA_A, extra: true })}\n`,
    "utf8",
  );
  assert.throws(() => verifyReleaseRevisionFile(file, SHA_A), /only service and revision/);
});
