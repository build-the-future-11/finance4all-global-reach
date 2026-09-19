import { describe, expect, it } from "vitest";
import { getAdministrativeReviewStatuses } from "@/lib/accountDeletionReview";

describe("account deletion administrative review statuses", () => {
  it("keeps pending available while the request is still pending", () => {
    expect(getAdministrativeReviewStatuses("pending")).toEqual([
      "pending",
      "in_progress",
      "rejected",
      "cancelled",
    ]);
  });

  it.each(["in_progress", "rejected", "cancelled"] as const)(
    "does not offer a forbidden reopen to pending from %s",
    (status) => {
      const statuses = getAdministrativeReviewStatuses(status);
      expect(statuses).toEqual(["in_progress", "rejected", "cancelled"]);
      expect(statuses).not.toContain("pending");
    },
  );
});
