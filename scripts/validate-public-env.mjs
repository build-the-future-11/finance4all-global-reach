#!/usr/bin/env node

import { loadEnv } from "vite";

const mode = process.env.NODE_ENV === "development" ? "development" : "production";
const fileEnv = loadEnv(mode, process.cwd(), "");
const env = { ...fileEnv, ...process.env };

const supabaseUrl = String(env.VITE_SUPABASE_URL || "").trim();
const supabaseKey = String(
  env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || "",
).trim();
const authRedirectOrigin = String(env.VITE_AUTH_REDIRECT_ORIGIN || "").trim();
const CANONICAL_SUPABASE_HOST = "pnemeegkwyaicsbnbnmg.supabase.co";

const failures = [];

if (!supabaseUrl) {
  failures.push("VITE_SUPABASE_URL is required");
} else {
  try {
    const url = new URL(supabaseUrl);
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
      failures.push("VITE_SUPABASE_URL must use https (http is allowed only for local development)");
    }
    if (url.hostname === "localhost" && url.port === "0") {
      failures.push("VITE_SUPABASE_URL must not use the old localhost:0 fallback");
    }
    if (!isLocal && url.hostname !== CANONICAL_SUPABASE_HOST) {
      failures.push(`VITE_SUPABASE_URL must target the canonical FinanceMeta project (${CANONICAL_SUPABASE_HOST})`);
    }
  } catch {
    failures.push("VITE_SUPABASE_URL must be a valid absolute URL");
  }
}

if (!supabaseKey) {
  failures.push("VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY is required");
} else if (supabaseKey === "missing-key") {
  failures.push("Supabase public key must not use the old missing-key fallback");
} else if (!supabaseKey.startsWith("sb_publishable_") && !supabaseKey.startsWith("eyJ")) {
  failures.push("Supabase public key must be a publishable key or legacy anon JWT");
}

if (!authRedirectOrigin) {
  failures.push("VITE_AUTH_REDIRECT_ORIGIN is required");
} else {
  try {
    const url = new URL(authRedirectOrigin);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
      failures.push("VITE_AUTH_REDIRECT_ORIGIN must be a clean https origin");
    }
  } catch {
    failures.push("VITE_AUTH_REDIRECT_ORIGIN must be a valid absolute URL");
  }
}

if (failures.length > 0) {
  console.error("[Finance4All] Refusing to build with invalid public Supabase configuration:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[Finance4All] Public Supabase configuration contract passed.");
