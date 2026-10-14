import assert from "node:assert/strict";
import test from "node:test";
import { verifyProduction } from "../scripts/verify-production.mjs";

// All responses are generated fixtures; no public or authenticated service is called.
const revision = "a".repeat(40);
const httpsSource = "https://pnemeegkwyaicsbnbnmg.supabase.co";
const wssSource = "wss://pnemeegkwyaicsbnbnmg.supabase.co";
const connect = `connect-src 'self' ${httpsSource} ${wssSource}`;
const policy = `default-src 'self'; frame-ancestors 'none'; object-src 'none'; ${connect}`;
const deployedPolicy = "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: https:; connect-src 'self' https://pnemeegkwyaicsbnbnmg.supabase.co wss://pnemeegkwyaicsbnbnmg.supabase.co; form-action 'self'; upgrade-insecure-requests";

function fixture(csp, extra = {}) {
  const calls = [];
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(input);
    calls.push({ path: url.pathname, method: init.method ?? "GET" });
    assert.equal(init.redirect, "error");
    assert.ok(init.signal instanceof AbortSignal);
    if (url.pathname === "/release-revision.json") {
      return Response.json({ service: "financemeta-member-portal", revision });
    }
    if (init.method === "HEAD") {
      const headers = {
        "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "strict-origin-when-cross-origin",
        "permissions-policy": "camera=(), microphone=(), geolocation=()",
        ...extra,
      };
      if (csp !== null) headers["content-security-policy"] = csp;
      return new Response(null, { headers });
    }
    return new Response('<div id="root"></div>', { headers: { "content-type": "text/html" } });
  };
  return { calls, fetchImpl };
}

const accepted = [
  ["ordinary contract", policy],
  ["exact repository Vercel policy", deployedPolicy],
  ["mixed-case directive names and keywords", policy.replace(/default-src|frame-ancestors|object-src|connect-src|'self'|'none'/g, (s) => s.toUpperCase())],
  ["ASCII tab separators", policy.replaceAll(" ", "\t")],
  ["reordered directives and empty segments", `; ${connect} ;; object-src 'none'; default-src 'self'; frame-ancestors 'none';`],
  ["first restrictive duplicate remains effective", `${policy}; default-src *; frame-ancestors *; object-src *; connect-src 'none'`],
];
for (const [name, csp] of accepted) {
  test(`CSP accepts ${name}`, async () => {
    const { fetchImpl, calls } = fixture(csp);
    const receipt = await verifyProduction({ fetchImpl, expectedRevision: revision });
    assert.equal(receipt.revisionVerification, "exact-match");
    assert.equal(receipt.securityHeaders.contentSecurityPolicy, new Headers({ csp }).get("csp"));
    assert.equal(calls.length, 6);
  });
}

const rejected = [
  ["weak first default directive", `default-src *; ${policy}`],
  ["weak first ancestor directive", `frame-ancestors *; ${policy}`],
  ["weak first object directive", `object-src *; ${policy}`],
  ["blocked first connection directive", `connect-src 'none'; ${policy}`],
  ["case-insensitive duplicate names", `DeFaUlT-SrC *; ${policy}`],
  ["empty first required directive", `object-src; ${policy}`],
  ["default directive name suffix", policy.replace("default-src", "x-default-src")],
  ["ancestor directive name suffix", policy.replace("frame-ancestors", "x-frame-ancestors")],
  ["object directive name suffix", policy.replace("object-src", "x-object-src")],
  ["default self plus wildcard", policy.replace("default-src 'self'", "default-src 'self' *")],
  ["ancestor none plus permissive source", policy.replace("frame-ancestors 'none'", "frame-ancestors 'none' https:")],
  ["object none plus permissive source", policy.replace("object-src 'none'", "object-src 'none' https:")],
  ["HTTPS source prefix masquerade", policy.replace(httpsSource, `${httpsSource}.invalid`)],
  ["WebSocket source prefix masquerade", policy.replace(wssSource, `${wssSource}.invalid`)],
  ["connection sources in the wrong directive", policy.replace("connect-src", "img-src")],
  ["safe strings inside an unrelated directive", `report-uri ${policy.replaceAll(";", " ")}`],
  ["combined policies need separate review", `default-src *; frame-ancestors *; object-src *, ${policy}`],
  ["non-ASCII whitespace is not a directive separator", policy.replace("object-src 'none'", "object-src\u00a0'none'")],
  ["absent enforcement header", null],
];
for (const [name, csp] of rejected) {
  test(`CSP rejects ${name} before route certification`, async () => {
    const { fetchImpl, calls } = fixture(csp, { "content-security-policy-report-only": policy });
    await assert.rejects(verifyProduction({ fetchImpl }), /content-security-policy/);
    assert.equal(calls.length, 2);
  });
}

test("CSP keeps the existing third-party-font restriction", async () => {
  const { fetchImpl, calls } = fixture(`${policy}; font-src https://fonts.googleapis.com`);
  await assert.rejects(verifyProduction({ fetchImpl }), /third-party font infrastructure/);
  assert.equal(calls.length, 2);
});
