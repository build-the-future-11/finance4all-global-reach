import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { withDeadline } from "@/lib/asyncDeadline";
import {
  assertFinanceMetaAuthRedirectOrigin,
  assertFinanceMetaSupabaseProject,
  assertFinanceMetaSupabasePublicKey,
} from "@/lib/supabaseProjectContract";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

export interface PublicAuthSettings {
  signupsEnabled: boolean;
  emailEnabled: boolean;
  googleEnabled: boolean;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.error(
    "[Finance4All] Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env, then restart the dev server.",
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
  assertFinanceMetaAuthRedirectOrigin(base, { allowLocal: import.meta.env.DEV });
  const origin = new URL(base);

  const redirect = new URL(path, origin);
  if (redirect.origin !== origin.origin) throw new Error("Auth redirects must stay on the configured origin");
  return redirect.toString();
}

export async function getPublicAuthSettings(): Promise<PublicAuthSettings | null> {
  if (!isSupabaseConfigured) return null;
  const controller = new AbortController();
  try {
    return await withDeadline(async () => {
      const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: supabaseKey },
        signal: controller.signal,
      });
      if (!response.ok) {
        void response.body?.cancel().catch(() => undefined);
        return null;
      }
      const value: unknown = await response.json();
      if (!value || typeof value !== "object" || Array.isArray(value)) return null;
      const settings = value as Record<string, unknown>;
      if (typeof settings.disable_signup !== "boolean") return null;
      if (!settings.external || typeof settings.external !== "object" || Array.isArray(settings.external)) return null;
      const external = settings.external as Record<string, unknown>;
      if (typeof external.email !== "boolean" || typeof external.google !== "boolean") return null;
      return {
        signupsEnabled: !settings.disable_signup,
        emailEnabled: external.email,
        googleEnabled: external.google,
      };
    }, 15_000, "Public auth settings");
  } catch {
    // The optional settings lookup must not hold a stalled connection open or
    // reinterpret an unavailable/malformed response as disabled signup methods.
    controller.abort();
    return null;
  }
}
