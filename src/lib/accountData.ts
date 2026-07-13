import { supabase } from "@/lib/supabase";

export interface AccountExportDocument {
  format: "finance4all-account-export";
  version: 1;
  exportedAt: string;
  accountId: string;
  data: Record<string, unknown>;
}

function valueOrThrow<T>(result: { data: T; error: { message: string } | null }, label: string): T {
  if (result.error) throw new Error(`Could not export ${label}.`);
  return result.data;
}

export function createAccountExportDocument(
  accountId: string,
  data: Record<string, unknown>,
  exportedAt = new Date().toISOString(),
): AccountExportDocument {
  return {
    format: "finance4all-account-export",
    version: 1,
    exportedAt,
    accountId,
    data,
  };
}

export async function buildAccountExport(accountId: string): Promise<AccountExportDocument> {
  const results = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name,email,role,bio,avatar_url,interests,open_to_collaborate,chapter_id,onboarding_completed_at,created_at,updated_at")
      .eq("id", accountId)
      .single(),
    supabase.from("digest_preferences").select("*").eq("user_id", accountId).maybeSingle(),
    supabase.from("news_bookmarks").select("*").eq("user_id", accountId),
    supabase.from("project_bookmarks").select("*").eq("user_id", accountId),
    supabase.from("lab_applications").select("*").eq("applicant_id", accountId),
    supabase.from("opportunity_interests").select("*").eq("user_id", accountId),
    supabase.from("studio_submissions").select("*").eq("author_id", accountId),
    supabase.from("essay_submissions").select("*").eq("author_id", accountId),
    supabase.from("essay_upvotes").select("*").eq("user_id", accountId),
    supabase.from("event_registrations").select("*").eq("user_id", accountId),
    supabase
      .from("connection_requests")
      .select("*")
      .or(`from_user_id.eq.${accountId},to_user_id.eq.${accountId}`),
    supabase.from("introduction_posts").select("*").eq("author_id", accountId),
    supabase.from("notifications").select("*").eq("user_id", accountId),
    supabase.from("education_lesson_progress").select("*").eq("user_id", accountId),
    supabase.from("digest_send_log").select("*").eq("user_id", accountId),
  ]);

  return createAccountExportDocument(accountId, {
    profile: valueOrThrow(results[0], "your profile"),
    digestPreferences: valueOrThrow(results[1], "digest preferences"),
    savedDebriefs: valueOrThrow(results[2], "saved Debriefs"),
    savedResearch: valueOrThrow(results[3], "saved research"),
    labApplications: valueOrThrow(results[4], "lab applications"),
    opportunityInterests: valueOrThrow(results[5], "opportunity interests"),
    studioSubmissions: valueOrThrow(results[6], "studio submissions"),
    essaySubmissions: valueOrThrow(results[7], "essay submissions"),
    essayUpvotes: valueOrThrow(results[8], "essay upvotes"),
    eventRegistrations: valueOrThrow(results[9], "event registrations"),
    connectionRequests: valueOrThrow(results[10], "connection requests"),
    introductionPosts: valueOrThrow(results[11], "introduction posts"),
    notifications: valueOrThrow(results[12], "notifications"),
    lessonProgress: valueOrThrow(results[13], "lesson progress"),
    digestDeliveryHistory: valueOrThrow(results[14], "digest delivery history"),
  });
}

export function downloadAccountExport(document: AccountExportDocument): void {
  const blob = new Blob([JSON.stringify(document, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = `finance4all-account-${document.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function deleteAccount(confirmation: string): Promise<void> {
  const { error } = await supabase.functions.invoke("delete-account", {
    body: { confirmation },
  });
  if (!error) return;

  let message = "Could not delete your account. Please try again.";
  const context = "context" in error ? error.context : undefined;
  if (context instanceof Response) {
    try {
      const payload = await context.clone().json() as { error?: unknown };
      if (typeof payload.error === "string" && payload.error.length <= 160) message = payload.error;
    } catch {
      // Keep the stable fallback when the function does not return JSON.
    }
  }
  throw new Error(message);
}
