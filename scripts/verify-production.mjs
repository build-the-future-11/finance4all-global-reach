#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_PORTAL_URL = "https://finance4all-global-reach.vercel.app";
const SERVICE = "financemeta-member-portal";
const REVISION = /^[0-9a-f]{40}$/;

function fail(message) {
  throw new Error(`[production-health] ${message}`);
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function checkedFetch(fetchImpl, url, init, label) {
  const response = await fetchImpl(url, {
    redirect: "follow",
    ...init,
    headers: {
      "cache-control": "no-cache",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) fail(`${label} returned HTTP ${response.status}`);
  return response;
}

function requireHeader(headers, name, expected) {
  const value = headers.get(name) ?? "";
  if (!expected.test(value)) fail(`${name} did not match ${expected}: ${value || "MISSING"}`);
  return value;
}

export async function verifyProduction({
  portalUrl = DEFAULT_PORTAL_URL,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== "function") fail("fetch implementation is required");

  const baseUrl = new URL(portalUrl);
  if (baseUrl.protocol !== "https:" || baseUrl.username || baseUrl.password) {
    fail("portal URL must be a credential-free HTTPS origin");
  }
  if (baseUrl.pathname !== "/" || baseUrl.search || baseUrl.hash) {
    fail("portal URL must not include a path, query, or fragment");
  }

  const revisionResponse = await checkedFetch(
    fetchImpl,
    new URL("/release-revision.json", baseUrl),
    undefined,
    "release revision",
  );
  const revisionPayload = await revisionResponse.json();
  if (revisionPayload?.service !== SERVICE) {
    fail(`release service must be ${SERVICE}`);
  }
  if (!REVISION.test(revisionPayload?.revision ?? "")) {
    fail("release revision must be an immutable lowercase Git SHA");
  }

  const headResponse = await checkedFetch(
    fetchImpl,
    new URL("/login", baseUrl),
    { method: "HEAD" },
    "login headers",
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
    const response = await checkedFetch(fetchImpl, new URL(route, baseUrl), undefined, route);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("text/html")) {
      fail(`${route} did not return HTML`);
    }
    const html = await response.text();
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

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const receipt = await verifyProduction({
      portalUrl: process.env.PORTAL_URL || DEFAULT_PORTAL_URL,
    });
    const receiptPath = argumentValue("--receipt");
    if (receiptPath) {
      writeFileSync(resolve(receiptPath), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    }
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
