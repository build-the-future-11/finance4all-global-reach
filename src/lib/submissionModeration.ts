/** Client-side helpers for submission moderation (mirrors server status enum). */

export const SUBMISSION_STATUSES = ["pending", "approved", "rejected", "archived"] as const;
export type SubmissionModerationStatus = (typeof SUBMISSION_STATUSES)[number];

export function isPublicSubmissionStatus(status: SubmissionModerationStatus): boolean {
  return status === "approved";
}

export function canAuthorSeeSubmission(
  status: SubmissionModerationStatus,
  isAuthor: boolean,
  isAdmin: boolean,
): boolean {
  return isAdmin || isAuthor || isPublicSubmissionStatus(status);
}

export function moderationLabel(status: SubmissionModerationStatus): string {
  switch (status) {
    case "pending":
      return "Pending review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

export const CATALYST_CURRICULUM_KEY = "catalyst-complete";

export function buildCertificateVerificationUrl(code: string, appOrigin?: string): string {
  const origin = (appOrigin ?? "").replace(/\/$/, "");
  const path = `/portal/education?cert=${encodeURIComponent(code)}`;
  return origin ? `${origin}${path}` : path;
}
