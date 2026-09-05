#!/usr/bin/env node

import { loadEnv } from "vite";

const mode = process.env.NODE_ENV === "development" ? "development" : "production";
const fileEnv = loadEnv(mode, process.cwd(), "");
const env = { ...fileEnv, ...process.env };

const FINANCEMETA_SUPABASE_PROJECT_REF = "pnemeegkwyaicsbnbnmg";
const FINANCEMETA_SUPABASE_HOST = `${FINANCEMETA_SUPABASE_PROJECT_REF}.supabase.co`;
const PUBLISHABLE_KEY_PATTERN = /^sb_publishable_[A-Za-z0-9_-]+$/;
const allowLocal = mode === "development";

const supabaseUrl = String(env.VITE_SUPABASE_URL || "").trim();
const supabaseKey = String(
  env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
).trim();

const failures = [];

function readJwtRole(key) {
  const parts = key.split(".");
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

if (!supabaseUrl) {
  failures.push("VITE_SUPABASE_URL is required");
} else {
  try {
    const url = new URL(supabaseUrl);
    const isLocal = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);

    if (isLocal && !allowLocal) {
      failures.push("VITE_SUPABASE_URL may target localhost only in development");
    }
    if (url.protocol !== "https:" && !(isLocal && allowLocal && url.protocol === "http:")) {
      failures.push("VITE_SUPABASE_URL must use https (http is allowed only for local development)");
    }
    if (isLocal && url.port === "0") {
      failures.push("VITE_SUPABASE_URL must not use the old localhost:0 fallback");
    }

    // FinanceMeta must never boot against another portfolio product's Supabase
    // project. A valid-looking foreign project URL can otherwise pass every
    // generic env check and silently send OAuth users to that project's Site URL.
    if (!isLocal && url.hostname !== FINANCEMETA_SUPABASE_HOST) {
      failures.push(
        `VITE_SUPABASE_URL must target the FinanceMeta Supabase project (${FINANCEMETA_SUPABASE_HOST}); received ${url.hostname}`,
      );
    }

    // Production must bind to the exact Supabase project origin. Credentials,
    // custom ports, paths, queries, or fragments can silently alter endpoint
    // construction even when the hostname itself looks correct.
    if (!isLocal && (url.username || url.password)) {
      failures.push("VITE_SUPABASE_URL must not contain credentials");
    }
    if (!isLocal && url.port) {
      failures.push("VITE_SUPABASE_URL must use the default HTTPS port");
    }
    if (!isLocal && (url.pathname !== "/" || url.search || url.hash)) {
      failures.push(
        "VITE_SUPABASE_URL must be the canonical project origin without path, query, or fragment",
      );
    }
  } catch {
    failures.push("VITE_SUPABASE_URL must be a valid absolute URL");
  }
}

if (!supabaseKey) {
  failures.push("VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY is required");
} else if (supabaseKey === "missing-key") {
  failures.push("Supabase public key must not use the old missing-key fallback");
} else {
  const jwtRole = readJwtRole(supabaseKey);
  if (/^sb_secret_/i.test(supabaseKey) || jwtRole === "service_role") {
    failures.push("Supabase public configuration must not contain a secret/service-role key");
  } else if (!allowLocal && !PUBLISHABLE_KEY_PATTERN.test(supabaseKey) && jwtRole !== "anon") {
    failures.push(
      "Supabase public configuration must use an sb_publishable_ key or a legacy anon JWT in production",
    );
  }
}

if (failures.length > 0) {
  console.error("[Finance4All] Refusing to build with invalid public Supabase configuration:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `[Finance4All] Public Supabase configuration contract passed for ${FINANCEMETA_SUPABASE_PROJECT_REF}.`,
);
