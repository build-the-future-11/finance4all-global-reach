import type { AccountDeletionStatus } from "@/types/database";

const ACTIVE_REVIEW_STATUSES = ["in_progress", "rejected", "cancelled"] as const;

export function getAdministrativeReviewStatuses(
  currentStatus: AccountDeletionStatus,
): readonly AccountDeletionStatus[] {
  if (currentStatus === "pending") {
    return ["pending", ...ACTIVE_REVIEW_STATUSES];
  }

  return ACTIVE_REVIEW_STATUSES;
}
