import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getAuthCallbackUrl } from "@/lib/appOrigin";
import { isClientSafeSupabaseKey } from "@/lib/security";

/**
 * Public Supabase project defaults (anon key is safe in client code; RLS enforces access).
 * Override with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or Vercel.
 */
const PROJECT_URL = "https://pnemeegkwyaicsbnbnmg.supabase.co";
const PROJECT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZW1lZWdrd3lhaWNzYm5ibm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1ODM4OTUsImV4cCI6MjA5OTE1OTg5NX0.U5ca6f0T7_e4FQ4X0DLxX-DyZy6dFFBkkAa7RT8mUaU";

function resolveSupabaseUrl(): string {
  const fromEnv = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (fromEnv && fromEnv.startsWith("https://") && fromEnv.includes("supabase.co")) {
    return fromEnv.replace(/\/$/, "");
  }
  if (fromEnv && import.meta.env.DEV) {
    console.warn("[Finance4All] Invalid VITE_SUPABASE_URL; using project default.");
  }
  return PROJECT_URL;
}

function resolveSupabaseKey(): string {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (anon) {
    if (!isClientSafeSupabaseKey(anon)) {
      if (import.meta.env.DEV) {
        console.error(
          "[Finance4All] VITE_SUPABASE_ANON_KEY looks like a secret key. Use the anon JWT only.",
        );
      }
      return PROJECT_ANON_KEY;
    }
    if (anon.startsWith("eyJ")) return anon;
  }

  const publishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (publishable?.startsWith("sb_publishable_")) {
    if (import.meta.env.DEV) {
      console.warn(
        "[Finance4All] VITE_SUPABASE_PUBLISHABLE_KEY is set but auth requires the anon JWT. Using project default anon key.",
      );
    }
    return PROJECT_ANON_KEY;
  }

  if (anon && isClientSafeSupabaseKey(anon)) return anon;

  if (import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL) {
    console.warn("[Finance4All] Using built-in Supabase project defaults. Copy .env.example to .env to override.");
  }

  return PROJECT_ANON_KEY;
}

const supabaseUrl = resolveSupabaseUrl();
const supabaseKey = resolveSupabaseKey();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && supabaseUrl.includes("supabase.co"),
);

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function getAuthRedirectUrl() {
  return getAuthCallbackUrl();
}
