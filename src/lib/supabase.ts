import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  assertFinanceMetaSupabaseProject,
  assertFinanceMetaSupabasePublicKey,
} from "@/lib/supabaseProjectContract";

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

const allowLocalSupabase = import.meta.env.DEV;
assertFinanceMetaSupabaseProject(supabaseUrl, {
  allowLocal: allowLocalSupabase,
});
assertFinanceMetaSupabasePublicKey(supabaseKey, {
  allowLocal: allowLocalSupabase,
});

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
