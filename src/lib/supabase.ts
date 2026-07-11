import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getAuthCallbackUrl } from "@/lib/appOrigin";
import { isClientSafeSupabaseKey } from "@/lib/security";

/**
 * Supabase client — credentials come only from environment variables.
 * Copy .env.example to .env for local development; set vars in Vercel for production.
 */
function resolveSupabaseUrl(): string {
  const fromEnv = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (fromEnv && fromEnv.startsWith("https://") && fromEnv.includes("supabase.co")) {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    console.warn("[Finance4All] Set VITE_SUPABASE_URL in .env (see .env.example).");
  } else {
    console.error("[Finance4All] VITE_SUPABASE_URL is required in production.");
  }
  return "";
}

function resolveSupabaseKey(): string {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (anon && isClientSafeSupabaseKey(anon) && anon.startsWith("eyJ")) {
    return anon;
  }
  if (anon && !isClientSafeSupabaseKey(anon)) {
    console.error("[Finance4All] VITE_SUPABASE_ANON_KEY looks like a secret key. Use the anon JWT only.");
  }
  if (import.meta.env.DEV) {
    console.warn("[Finance4All] Set VITE_SUPABASE_ANON_KEY in .env (see .env.example).");
  } else {
    console.error("[Finance4All] VITE_SUPABASE_ANON_KEY is required in production.");
  }
  return "";
}

const supabaseUrl = resolveSupabaseUrl();
const supabaseKey = resolveSupabaseKey();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && supabaseUrl.includes("supabase.co"),
);

export const supabase = createClient<Database>(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function getAuthRedirectUrl() {
  return getAuthCallbackUrl();
}
