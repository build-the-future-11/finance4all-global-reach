import assert from "node:assert/strict";
import test from "node:test";

import { resolveReleaseRevision, validateReleaseRevision } from "../scripts/release-revision.mjs";

const SHA_A = "0123456789abcdef0123456789abcdef01234567";
const SHA_B = "89abcdef0123456789abcdef0123456789abcdef";

test("release revisions accept only immutable lowercase Git SHAs", () => {
  assert.equal(validateReleaseRevision(SHA_A), SHA_A);
  for (const invalid of ["", "main", SHA_A.toUpperCase(), SHA_A.slice(1), `${SHA_A}0`]) {
    assert.throws(() => validateReleaseRevision(invalid), /immutable lowercase 40-character Git SHA/);
  }
});

test("deployment-provided source identities take precedence over repository HEAD", () => {
  assert.equal(resolveReleaseRevision({ env: { SOURCE_SHA: SHA_A }, gitHead: () => SHA_B }), SHA_A);
  assert.equal(resolveReleaseRevision({ env: { VERCEL_GIT_COMMIT_SHA: SHA_B }, gitHead: () => SHA_A }), SHA_B);
  assert.equal(resolveReleaseRevision({ env: {}, gitHead: () => SHA_A }), SHA_A);
  assert.throws(
    () => resolveReleaseRevision({ env: { SOURCE_SHA: SHA_A, VERCEL_GIT_COMMIT_SHA: SHA_B } }),
    /environment disagrees/,
  );
});
