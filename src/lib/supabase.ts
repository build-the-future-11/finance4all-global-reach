import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const FINANCEMETA_SUPABASE_PROJECT_REF = "pnemeegkwyaicsbnbnmg";
const FINANCEMETA_SUPABASE_HOST = `${FINANCEMETA_SUPABASE_PROJECT_REF}.supabase.co`;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.error(
    "[Finance4All] Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server.",
  );
}

function assertFinanceMetaSupabaseProject(urlValue: string | undefined) {
  if (!urlValue) return;

  let parsed: URL;
  try {
    parsed = new URL(urlValue);
  } catch {
    throw new Error("[Finance4All] VITE_SUPABASE_URL is not a valid absolute URL.");
  }

  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  if (!isLocal && parsed.hostname !== FINANCEMETA_SUPABASE_HOST) {
    throw new Error(
      `[Finance4All] Refusing to start against foreign Supabase project ${parsed.hostname}. Expected ${FINANCEMETA_SUPABASE_HOST}.`,
    );
  }
}

assertFinanceMetaSupabaseProject(supabaseUrl);

export const supabase = createClient<Database>(
  supabaseUrl || "http://localhost:0",
  supabaseKey || "missing-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);

export function getAuthRedirectUrl() {
  return `${window.location.origin}/auth/callback`;
}
