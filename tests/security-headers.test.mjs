import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const deploymentDoc = readFileSync(new URL("../DEPLOYMENT.md", import.meta.url), "utf8");
const globalStyles = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
const vercelConfig = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
);

function canonicalSupabaseHost() {
  const match = deploymentDoc.match(
    /`VITE_SUPABASE_URL`\s*\|\s*`https:\/\/([a-z0-9-]+\.supabase\.co)`/,
  );
  assert.ok(match, "DEPLOYMENT.md must declare the canonical VITE_SUPABASE_URL");
  return match[1];
}

function globalCsp() {
  const matches = (vercelConfig.headers ?? [])
    .flatMap((rule) => rule.headers ?? [])
    .filter((header) => header.key === "Content-Security-Policy");
  assert.equal(matches.length, 1, "vercel.json must define exactly one CSP header");
  return matches[0].value;
}

test("CSP connect-src is pinned to the documented canonical Supabase project", () => {
  const expectedHost = canonicalSupabaseHost();
  const csp = globalCsp();

  const httpsHosts = [
    ...csp.matchAll(/https:\/\/([a-z0-9-]+\.supabase\.co)/g),
  ].map((match) => match[1]);
  const wssHosts = [
    ...csp.matchAll(/wss:\/\/([a-z0-9-]+\.supabase\.co)/g),
  ].map((match) => match[1]);

  assert.deepEqual(
    [...new Set(httpsHosts)],
    [expectedHost],
    "CSP must not authorize a foreign Supabase HTTPS origin",
  );
  assert.deepEqual(
    [...new Set(wssHosts)],
    [expectedHost],
    "CSP must not authorize a foreign Supabase WebSocket origin",
  );
  assert.match(csp, new RegExp(`connect-src[^;]*https://${expectedHost}`));
  assert.match(csp, new RegExp(`connect-src[^;]*wss://${expectedHost}`));
});

test("production styling does not depend on third-party font infrastructure", () => {
  const csp = globalCsp();

  assert.doesNotMatch(globalStyles, /@import\s+url\(/i);
  assert.doesNotMatch(csp, /fonts\.(?:googleapis|gstatic)\.com/i);
  assert.match(csp, /font-src 'self' data:/);
});
