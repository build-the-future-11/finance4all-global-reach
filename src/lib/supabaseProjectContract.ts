export const FINANCEMETA_SUPABASE_PROJECT_REF = "pnemeegkwyaicsbnbnmg";
export const FINANCEMETA_SUPABASE_HOST = `${FINANCEMETA_SUPABASE_PROJECT_REF}.supabase.co`;

const LOCAL_SUPABASE_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export interface FinanceMetaSupabaseProjectOptions {
  allowLocal: boolean;
}

export function assertFinanceMetaSupabaseProject(
  urlValue: string | undefined,
  { allowLocal }: FinanceMetaSupabaseProjectOptions,
) {
  if (!urlValue) return;

  let parsed: URL;
  try {
    parsed = new URL(urlValue);
  } catch {
    throw new Error("[Finance4All] VITE_SUPABASE_URL is not a valid absolute URL.");
  }

  const isLocal = LOCAL_SUPABASE_HOSTS.has(parsed.hostname);

  if (isLocal) {
    if (!allowLocal) {
      throw new Error(
        "[Finance4All] Local Supabase URLs are allowed only in development.",
      );
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(
        "[Finance4All] Local Supabase URL must use http or https.",
      );
    }
    if (parsed.port === "0") {
      throw new Error(
        "[Finance4All] Local Supabase URL must not use the old port-0 fallback.",
      );
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
}
