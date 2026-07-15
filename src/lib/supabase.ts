import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getAuthCallbackUrl } from "@/lib/appOrigin";
import { isClientSafeSupabaseKey } from "@/lib/security";

/** Supabase client — credentials come only from environment variables. */
function resolveSupabaseUrl(): string {
  const fromEnv = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (fromEnv && fromEnv.startsWith("https://") && fromEnv.includes("supabase.co")) {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    console.warn("[Finance4All] Account service URL is not configured for this local environment.");
  } else {
    console.error("[Finance4All] Account service URL is required in production.");
  }
  return "";
}

function resolveSupabaseKey(): string {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (anon && isClientSafeSupabaseKey(anon) && anon.startsWith("eyJ")) {
    return anon;
  }
  if (anon && !isClientSafeSupabaseKey(anon)) {
    console.error("[Finance4All] Account service key is not a valid browser-safe anon key.");
  }
  if (import.meta.env.DEV) {
    console.warn("[Finance4All] Account service key is not configured for this local environment.");
  } else {
    console.error("[Finance4All] Account service key is required in production.");
  }
  return "";
}

const supabaseUrl = resolveSupabaseUrl();
const supabaseKey = resolveSupabaseKey();

if (import.meta.env.PROD && (!supabaseUrl || !supabaseKey)) {
  throw new Error(
    "[Finance4All] Account service configuration is required in production.",
  );
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && supabaseUrl.includes("supabase.co"),
);

// The invalid fallback keeps public, configuration-free local previews usable;
// production builds reject missing credentials before this client is created.
export const supabase = createClient<Database>(supabaseUrl || "https://config-required.invalid", supabaseKey || "config-required", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function getAuthRedirectUrl() {
  return getAuthCallbackUrl();
}
