#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_PORTAL_URL = "https://finance4all-global-reach.vercel.app";
const SERVICE = "financemeta-member-portal";
const REVISION = /^[0-9a-f]{40}$/;
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const MAX_REVISION_BYTES = 16 * 1024;
const MAX_HTML_BYTES = 1024 * 1024;

function fail(message) {
  throw new Error(`[production-health] ${message}`);
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--") || process.argv.indexOf(name, index + 1) >= 0) {
    fail(`${name} requires exactly one value`);
  }
  return value;
}

function mediaType(response) {
  return (response.headers.get("content-type") ?? "").split(";", 1)[0].trim().toLowerCase();
}

async function readBoundedText(response, limit, label) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) fail(`${label} exceeds ${limit} bytes`);
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    // Cancel on a failed read/limit check; release on success as well.
    try { await reader.cancel(); } finally { reader.releaseLock(); }
  }
}

async function checkedFetch(fetchImpl, url, init, label, timeoutMs, consume) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`[production-health] ${label} timed out after ${timeoutMs} ms`);
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      deadline,
      (async () => {
        const response = await fetchImpl(url, {
          ...init,
          // A redirect must not certify a different origin or login destination.
          redirect: "error",
          signal: controller.signal,
          headers: {
            "cache-control": "no-cache",
            ...(init?.headers ?? {}),
          },
        });
        if (!response.ok) fail(`${label} returned HTTP ${response.status}`);
        if (response.redirected || (response.url && new URL(response.url).origin !== url.origin)) {
          fail(`${label} returned a redirected or foreign-origin response`);
        }
        return consume ? await consume(response) : response;
      })(),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function requireHeader(headers, name, expected) {
  const value = headers.get(name) ?? "";
  if (!expected.test(value)) fail(`${name} did not match ${expected}: ${value || "MISSING"}`);
  return value;
}

export async function verifyProduction({
  portalUrl = DEFAULT_PORTAL_URL,
  fetchImpl = globalThis.fetch,
  expectedRevision = null,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== "function") fail("fetch implementation is required");
  if (expectedRevision !== null && (typeof expectedRevision !== "string" || !REVISION.test(expectedRevision))) {
    fail("expected revision must be an immutable lowercase Git SHA");
  }
  if (!Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 1 || requestTimeoutMs > 60_000) {
    fail("request timeout must be an integer from 1 to 60000 ms");
  }

  const baseUrl = new URL(portalUrl);
  if (baseUrl.protocol !== "https:" || baseUrl.username || baseUrl.password) {
    fail("portal URL must be a credential-free HTTPS origin");
  }
  if (baseUrl.pathname !== "/" || baseUrl.search || baseUrl.hash) {
    fail("portal URL must not include a path, query, or fragment");
  }

  const revisionPayload = await checkedFetch(
    fetchImpl,
    new URL("/release-revision.json", baseUrl),
    undefined,
    "release revision",
    requestTimeoutMs,
    async (response) => {
      if (mediaType(response) !== "application/json") fail("release revision did not return JSON");
      return JSON.parse(await readBoundedText(response, MAX_REVISION_BYTES, "release revision"));
    },
  );
  if (revisionPayload === null || typeof revisionPayload !== "object" || Array.isArray(revisionPayload)) {
    fail("release revision payload must be an object");
  }
  if (revisionPayload?.service !== SERVICE) {
    fail(`release service must be ${SERVICE}`);
  }
  if (typeof revisionPayload.revision !== "string" || !REVISION.test(revisionPayload.revision)) {
    fail("release revision must be an immutable lowercase Git SHA");
  }

  if (expectedRevision !== null && revisionPayload.revision !== expectedRevision) {
    fail(`release revision mismatch: expected ${expectedRevision}, received ${revisionPayload.revision}`);
  }

  const headResponse = await checkedFetch(
    fetchImpl,
    new URL("/login", baseUrl),
    { method: "HEAD" },
    "login headers",
    requestTimeoutMs,
  );
  const csp = requireHeader(headResponse.headers, "content-security-policy", /default-src 'self'/);
  for (const directive of [
    "frame-ancestors 'none'",
    "object-src 'none'",
    "https://pnemeegkwyaicsbnbnmg.supabase.co",
    "wss://pnemeegkwyaicsbnbnmg.supabase.co",
  ]) {
    if (!csp.includes(directive)) fail(`content-security-policy is missing ${directive}`);
  }
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(csp)) {
    fail("content-security-policy still permits third-party font infrastructure");
  }
  requireHeader(headResponse.headers, "strict-transport-security", /max-age=63072000/);
  requireHeader(headResponse.headers, "x-content-type-options", /^nosniff$/i);
  requireHeader(headResponse.headers, "x-frame-options", /^DENY$/i);
  requireHeader(headResponse.headers, "referrer-policy", /^strict-origin-when-cross-origin$/i);
  requireHeader(headResponse.headers, "permissions-policy", /camera=\(\).*microphone=\(\).*geolocation=\(\)/);

  const routes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/auth/callback?error=access_denied&error_code=health_check",
  ];
  for (const route of routes) {
    const html = await checkedFetch(
      fetchImpl, new URL(route, baseUrl), undefined, route, requestTimeoutMs,
      async (response) => {
        if (mediaType(response) !== "text/html") fail(`${route} did not return HTML`);
        return readBoundedText(response, MAX_HTML_BYTES, route);
      },
    );
    if (!html.includes('<div id="root"></div>')) {
      fail(`${route} did not return the portal application shell`);
    }
  }

  return {
    schema: "financemeta.portal-production-health.v1",
    checkedAt: new Date().toISOString(),
    portalUrl: baseUrl.origin,
    service: SERVICE,
    revision: revisionPayload.revision,
    revisionVerification: expectedRevision === null ? "observed-only" : "exact-match",
    expectedRevision,
    routes,
    securityHeaders: {
      contentSecurityPolicy: csp,
      strictTransportSecurity: headResponse.headers.get("strict-transport-security"),
      xContentTypeOptions: headResponse.headers.get("x-content-type-options"),
      xFrameOptions: headResponse.headers.get("x-frame-options"),
      referrerPolicy: headResponse.headers.get("referrer-policy"),
      permissionsPolicy: headResponse.headers.get("permissions-policy"),
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    // Parse before making a request, so malformed arguments fail without I/O.
    const receiptPath = argumentValue("--receipt");
    const expectedRevision = argumentValue("--expected-revision") ?? process.env.EXPECTED_DEPLOYED_REVISION ?? null;
    const timeoutValue = argumentValue("--timeout-ms");
    const receipt = await verifyProduction({
      portalUrl: process.env.PORTAL_URL || DEFAULT_PORTAL_URL,
      expectedRevision,
      requestTimeoutMs: timeoutValue === null ? DEFAULT_REQUEST_TIMEOUT_MS : Number(timeoutValue),
    });
    if (receiptPath) {
      writeFileSync(resolve(receiptPath), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    }
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
