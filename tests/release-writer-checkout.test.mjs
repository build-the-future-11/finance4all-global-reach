import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const OTHER_SHA = "89abcdef0123456789abcdef0123456789abcdef";

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), "portal-release-checkout-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  mkdirSync(join(cwd, "scripts"));
  for (const name of ["release-revision.mjs", "write-release-revision.mjs"]) {
    copyFileSync(new URL(`../scripts/${name}`, import.meta.url), join(cwd, "scripts", name));
  }
  writeFileSync(join(cwd, ".gitignore"), "dist/\n");
  writeFileSync(join(cwd, "vercel.json"), '{"framework":"vite","rewrites":[]}\n');
  const git = (...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git("init", "--quiet");
  git("add", ".");
  git("-c", "user.name=Release test", "-c", "user.email=release-test@example.invalid", "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "fixture");
  const head = git("rev-parse", "HEAD");
  mkdirSync(join(cwd, "dist"));
  const run = (overrides = {}) => {
    const env = { ...process.env };
    for (const key of ["SOURCE_SHA", "VERCEL_GIT_COMMIT_SHA", "GITHUB_SHA", "VERCEL"]) delete env[key];
    return spawnSync(process.execPath, ["scripts/write-release-revision.mjs"], {
      cwd, env: { ...env, ...overrides }, encoding: "utf8", timeout: 10000,
    });
  };
  return { cwd, head, git, run, receipt: () => JSON.parse(readFileSync(join(cwd, "dist", "release-revision.json"), "utf8")) };
}

test("writer stamps real Git HEAD despite a different pull-request event SHA", (t) => {
  const f = fixture(t);
  const r = f.run({ GITHUB_SHA: OTHER_SHA });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(f.receipt(), { service: "financemeta-member-portal", revision: f.head });
});

test("writer accepts matching provider assertions and remains byte-clean", (t) => {
  const f = fixture(t);
  const r = f.run({ SOURCE_SHA: f.head, VERCEL_GIT_COMMIT_SHA: f.head, GITHUB_SHA: OTHER_SHA });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(f.receipt().revision, f.head);
  assert.equal(f.git("status", "--porcelain"), "");
});

test("writer rejects a Vercel checkout mismatch without producing a receipt", (t) => {
  const f = fixture(t);
  const r = f.run({ VERCEL: "1", VERCEL_GIT_COMMIT_SHA: OTHER_SHA });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /differs from checked-out HEAD/);
  assert.equal(existsSync(join(f.cwd, "dist", "release-revision.json")), false);
});

test("writer refuses conflicting explicit deployment identities", (t) => {
  const f = fixture(t);
  const r = f.run({ SOURCE_SHA: f.head, VERCEL_GIT_COMMIT_SHA: OTHER_SHA });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /environment disagrees/);
  assert.equal(existsSync(join(f.cwd, "dist", "release-revision.json")), false);
});

test("writer preserves the tracked-source cleanliness gate", (t) => {
  const f = fixture(t);
  writeFileSync(join(f.cwd, "vercel.json"), '{"framework":"different"}\n');
  const r = f.run();
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /clean source checkout/);
  assert.equal(existsSync(join(f.cwd, "dist", "release-revision.json")), false);
});

test("writer preserves the untracked-source cleanliness gate", (t) => {
  const f = fixture(t);
  writeFileSync(join(f.cwd, "uncommitted.mjs"), "export const changed = true;\n");
  const r = f.run();
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /clean source checkout/);
});

test("Vercel formatting normalization still stamps the same real source", (t) => {
  const f = fixture(t);
  writeFileSync(join(f.cwd, "vercel.json"), '{ "rewrites": [], "framework": "vite" }');
  const r = f.run({ VERCEL: "1", VERCEL_GIT_COMMIT_SHA: f.head, GITHUB_SHA: OTHER_SHA });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(f.receipt().revision, f.head);
  assert.equal(f.git("status", "--porcelain"), "");
});
