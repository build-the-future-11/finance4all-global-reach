export const FINANCEMETA_SUPABASE_PROJECT_REF = "pnemeegkwyaicsbnbnmg";
export const FINANCEMETA_SUPABASE_HOST = `${FINANCEMETA_SUPABASE_PROJECT_REF}.supabase.co`;

const LOCAL_SUPABASE_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const PUBLISHABLE_KEY_PATTERN = /^sb_publishable_[A-Za-z0-9_-]+$/;

export interface FinanceMetaSupabaseProjectOptions {
  allowLocal: boolean;
}

function readJwtRole(key: string): string | null {
  const parts = key.split(".");
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function assertFinanceMetaSupabaseProject(
  urlValue: string | undefined,
  { allowLocal }: FinanceMetaSupabaseProjectOptions,
) {
  if (!urlValue) {
    if (allowLocal) return;
    throw new Error("[Finance4All] VITE_SUPABASE_URL is required outside development.");
  }

  let parsed: URL;
  try {
    parsed = new URL(urlValue);
  } catch {
    throw new Error("[Finance4All] VITE_SUPABASE_URL is not a valid absolute URL.");
  }

  const isLocal = LOCAL_SUPABASE_HOSTS.has(parsed.hostname);
  if (isLocal) {
    if (!allowLocal) {
      throw new Error("[Finance4All] Local Supabase URLs are allowed only in development.");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("[Finance4All] Local Supabase URL must use http or https.");
    }
    if (parsed.port === "0") {
      throw new Error("[Finance4All] Local Supabase URL must not use the old port-0 fallback.");
    }
    return;
  }

  if (parsed.protocol !== "https:") {
    throw new Error("[Finance4All] Production Supabase URL must use https.");
  }
  if (parsed.hostname !== FINANCEMETA_SUPABASE_HOST) {
    throw new Error(
      `[Finance4All] Refusing to start against foreign Supabase project ${parsed.hostname}. Expected ${FINANCEMETA_SUPABASE_HOST}.`,
    );
  }
  if (parsed.username || parsed.password) {
    throw new Error("[Finance4All] Production Supabase URL must not contain credentials.");
  }
  if (parsed.port) {
    throw new Error("[Finance4All] Production Supabase URL must use the default HTTPS port.");
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error(
      "[Finance4All] Production Supabase URL must be the canonical project origin without path, query, or fragment.",
    );
  }
}

export function assertFinanceMetaSupabasePublicKey(
  keyValue: string | undefined,
  { allowLocal }: FinanceMetaSupabaseProjectOptions,
) {
  const key = String(keyValue || "").trim();
  if (!key) {
    if (allowLocal) return;
    throw new Error("[Finance4All] A Supabase anon or publishable key is required outside development.");
  }
  if (key === "missing-key") {
    throw new Error("[Finance4All] Supabase public key must not use the old missing-key fallback.");
  }

  const jwtRole = readJwtRole(key);
  if (/^sb_secret_/i.test(key) || jwtRole === "service_role") {
    throw new Error(
      "[Finance4All] Refusing to expose a Supabase secret/service-role key in the public client.",
    );
  }
  if (jwtRole && jwtRole !== "anon") {
    throw new Error(
      "[Finance4All] Production Supabase public key must be an sb_publishable_ key or a legacy anon JWT.",
    );
  }

  if (allowLocal) return;
  if (!PUBLISHABLE_KEY_PATTERN.test(key) && jwtRole !== "anon") {
    throw new Error(
      "[Finance4All] Production Supabase public key must be an sb_publishable_ key or a legacy anon JWT.",
    );
  }
}
