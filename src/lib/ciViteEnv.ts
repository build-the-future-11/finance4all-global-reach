/**
 * Coerce local/dev Vite env into values that pass production build validation.
 * Used by Playwright CI webServer builds when developers have http://localhost VITE_APP_URL.
 */

export function coerceHttpsAppUrl(raw: string | undefined, fallback: string): string {
  const v = raw?.trim();
  return v?.startsWith("https://") ? v : fallback;
}

export function coerceSupabaseUrl(raw: string | undefined, fallback: string): string {
  const v = raw?.trim();
  return v?.startsWith("https://") && v.includes("supabase.co") ? v : fallback;
}

export function coerceAnonKey(raw: string | undefined, fallback: string): string {
  const v = raw?.trim();
  return v?.startsWith("eyJ") ? v : fallback;
}

export const CI_VITE_PLACEHOLDERS = {
  appUrl: "https://ci-placeholder.vercel.app",
  supabaseUrl: "https://ci-placeholder.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpLXBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.ci-placeholder-signature-for-build-only",
} as const;

export function resolveCiViteEnv(env: NodeJS.ProcessEnv = process.env) {
  return {
    VITE_APP_URL: coerceHttpsAppUrl(env.VITE_APP_URL, CI_VITE_PLACEHOLDERS.appUrl),
    VITE_SUPABASE_URL: coerceSupabaseUrl(env.VITE_SUPABASE_URL, CI_VITE_PLACEHOLDERS.supabaseUrl),
    VITE_SUPABASE_ANON_KEY: coerceAnonKey(env.VITE_SUPABASE_ANON_KEY, CI_VITE_PLACEHOLDERS.anonKey),
  };
}
