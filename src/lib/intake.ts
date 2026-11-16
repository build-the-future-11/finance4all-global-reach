import { z } from "zod";

export const intakeSchema = z.object({
  call_id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/),
  motivation: z.string().trim().min(80, "Describe your question in at least 80 characters.").max(4000),
  preparation: z.string().trim().min(30, "Describe your preparation in at least 30 characters.").max(2000),
  availability: z.string().trim().min(3).max(160),
  work_url: z.string().trim().max(500).refine(value => {
    if (!value) return true;
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
  }, "Use a public HTTPS link without embedded credentials."),
  consent: z.boolean().refine(value => value, "Read and accept the submission privacy notice."),
});
export type IntakeInput = z.infer<typeof intakeSchema>;
export type IntakeStatus = "submitted" | "under_review" | "accepted" | "declined" | "withdrawn";
export type IntakeCall = { id: string; title: string; kind: "cohort" | "research" | "chapter" | "partnership" | "event" | "competition"; description: string; status: "interest" | "open" | "closed"; closes_at: string | null; created_at: string }
export type IntakeSubmission = { id: string; applicant_id: string; call_id: string; motivation: string; preparation: string; availability: string; work_url: string | null; privacy_version: string; consent: boolean; status: IntakeStatus; review_note: string; created_at: string; updated_at: string }
export function callAcceptsSubmissions(call: IntakeCall, now = Date.now()) {
  return call.status !== "closed" && (!call.closes_at || Date.parse(call.closes_at) > now);
}
export function intakeError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (["42P01", "PGRST205"].includes(code)) return "Native intake is not available on this deployment. Use the existing application form or contact the team. Nothing has been confirmed.";
  if (code === "23505") return "You already have a submission for this call. Refresh your submissions to see its receipt.";
  if (code === "23514") return "This intake is closed, the daily limit was reached, or an answer failed validation. Check the call and your answers before retrying.";
  if (code === "42501") return "Your account does not have permission for this action. Sign in again or contact the team.";
  return "The action could not be confirmed. Your answers remain on this page. Refresh submissions before retrying.";
}
