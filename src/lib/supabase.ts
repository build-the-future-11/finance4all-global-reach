import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  assertFinanceMetaSupabaseProject,
  assertFinanceMetaSupabasePublicKey,
} from "@/lib/supabaseProjectContract";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseKey =
  String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim() ||
  String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export interface PublicAuthSettings {
  signupsEnabled: boolean;
  emailEnabled: boolean;
  googleEnabled: boolean;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.error(
    "[Finance4All] Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server.",
  );
}

const allowLocalSupabase = import.meta.env.DEV;
assertFinanceMetaSupabaseProject(supabaseUrl, { allowLocal: allowLocalSupabase });
assertFinanceMetaSupabasePublicKey(supabaseKey, { allowLocal: allowLocalSupabase });

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

export function getAuthRedirectUrl(path = "/auth/callback") {
  const configuredOrigin = String(import.meta.env.VITE_AUTH_REDIRECT_ORIGIN ?? "").trim();
  const base = configuredOrigin || window.location.origin;
  const origin = new URL(base);
  if (origin.pathname !== "/" || origin.search || origin.hash || origin.username || origin.password) {
    throw new Error("VITE_AUTH_REDIRECT_ORIGIN must be a clean origin");
  }

  const redirect = new URL(path, origin);
  if (redirect.origin !== origin.origin) throw new Error("Auth redirects must stay on the configured origin");
  return redirect.toString();
}

export async function getPublicAuthSettings(): Promise<PublicAuthSettings | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseKey },
    });
    if (!response.ok) return null;
    const settings = (await response.json()) as {
      disable_signup?: boolean;
      external?: { email?: boolean; google?: boolean };
    };
    return {
      signupsEnabled: settings.disable_signup !== true,
      emailEnabled: settings.external?.email === true,
      googleEnabled: settings.external?.google === true,
    };
  } catch {
    return null;
  }
}
