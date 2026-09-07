import assert from "node:assert/strict";
import test from "node:test";

import { verifyProduction } from "../scripts/verify-production.mjs";

const revision = "736f24cbe7ff8b1d568abeec9a80610602831d4c";
const securityHeaders = {
  "content-security-policy": "default-src 'self'; frame-ancestors 'none'; object-src 'none'; connect-src 'self' https://pnemeegkwyaicsbnbnmg.supabase.co wss://pnemeegkwyaicsbnbnmg.supabase.co",
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

function productionFetch({ service = "financemeta-member-portal", headers = securityHeaders, html = '<div id="root"></div>' } = {}) {
  return async (input, init = {}) => {
    const url = new URL(input);
    if (url.pathname === "/release-revision.json") {
      return new Response(JSON.stringify({ service, revision }), {
        headers: { "content-type": "application/json" },
      });
    }
    if (url.pathname === "/login" && init.method === "HEAD") {
      return new Response(null, { headers });
    }
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  };
}

test("accepts the live portal contract and records its immutable revision", async () => {
  const receipt = await verifyProduction({ fetchImpl: productionFetch() });
  assert.equal(receipt.service, "financemeta-member-portal");
  assert.equal(receipt.revision, revision);
  assert.equal(receipt.routes.length, 4);
});

test("rejects a foreign release identity", async () => {
  await assert.rejects(
    verifyProduction({ fetchImpl: productionFetch({ service: "vertexed" }) }),
    /release service must be financemeta-member-portal/,
  );
});

test("rejects insecure or stale response headers", async () => {
  await assert.rejects(
    verifyProduction({
      fetchImpl: productionFetch({
        headers: {
          ...securityHeaders,
          "content-security-policy": `${securityHeaders["content-security-policy"]} https://fonts.googleapis.com`,
        },
      }),
    }),
    /third-party font infrastructure/,
  );
});

test("rejects a route that no longer returns the application shell", async () => {
  await assert.rejects(
    verifyProduction({ fetchImpl: productionFetch({ html: "<h1>Not found</h1>" }) }),
    /did not return the portal application shell/,
  );
});
