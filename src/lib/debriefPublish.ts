/**
 * Client-side Finance Debrief publish guards.
 * Server RLS/triggers/RPCs are authoritative; these mirror rules for UX + unit tests.
 */

export type EditorialStatus =
  | "draft"
  | "in_review"
  | "scheduled"
  | "published"
  | "corrected"
  | "archived";

export interface PublishGuardInput {
  status: EditorialStatus;
  sourceId: string | null | undefined;
  sourceIsActive?: boolean;
  aiAssisted: boolean;
  aiLogId?: string | null;
  aiLogUsedInPublish?: boolean;
}

export interface PublishGuardResult {
  ok: boolean;
  errors: string[];
}

const PUBLISH_STATUSES: EditorialStatus[] = ["published", "corrected", "scheduled"];

export function canTransitionToStatus(input: PublishGuardInput): PublishGuardResult {
  const errors: string[] = [];

  if (PUBLISH_STATUSES.includes(input.status)) {
    if (!input.sourceId) {
      errors.push("Cannot publish Finance Debrief content without an approved source");
    } else if (input.sourceIsActive === false) {
      errors.push("Approved source must exist and be active before publish");
    }
  }

  if (
    (input.status === "published" || input.status === "corrected") &&
    input.aiAssisted
  ) {
    if (!input.aiLogId) {
      errors.push("AI-assisted articles require a generation log id before publish");
    } else if (input.aiLogUsedInPublish === false) {
      errors.push("AI generation log must be marked for publish");
    }
  }

  return { ok: errors.length === 0, errors };
}

export function assertCanPublish(input: PublishGuardInput): void {
  const result = canTransitionToStatus({ ...input, status: input.status === "corrected" ? "corrected" : "published" });
  if (!result.ok) {
    throw new Error(result.errors[0]);
  }
}

export const DEBRIEF_DISCLAIMER =
  "Educational content only — not financial, investment, or professional advice. Always verify with original sources and qualified advisors.";

export const DEBRIEF_DISCLAIMER_VERSION = "edu-not-advice-v1";
