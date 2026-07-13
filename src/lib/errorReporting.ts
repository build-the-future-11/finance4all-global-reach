import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { sanitizeUserFacingError } from "@/lib/authErrors";

export interface ErrorReportContext {
  componentStack?: string;
  tags?: Record<string, string>;
}

function safeTags(tags: Record<string, string> | undefined): Record<string, string> {
  if (!tags) return {};
  return Object.fromEntries(
    Object.entries(tags)
      .filter(([key, value]) => /^[a-z][a-z0-9_]{0,39}$/.test(key) && value.length <= 80)
      .slice(0, 10),
  );
}

/** Record a bounded authenticated error signal without stack traces or user content. */
export function reportError(error: Error, context?: ErrorReportContext) {
  if (import.meta.env.DEV) {
    console.error("[error-reporting]", error, context ?? {});
    return;
  }
  if (!isSupabaseConfigured) return;

  const message = sanitizeUserFacingError(error.message, "An unexpected client error occurred.");
  void supabase.rpc("report_client_error", {
    p_error_name: (error.name || "Error").slice(0, 80),
    p_message: message.slice(0, 500),
    p_tags: safeTags(context?.tags),
  });
}
