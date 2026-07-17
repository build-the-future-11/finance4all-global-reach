import { describe, expect, it } from "vitest";
import {
  buildCertificateVerificationUrl,
  canAuthorSeeSubmission,
  isPublicSubmissionStatus,
  moderationLabel,
} from "./submissionModeration";

describe("submissionModeration", () => {
  it("only approved is public", () => {
    expect(isPublicSubmissionStatus("approved")).toBe(true);
    expect(isPublicSubmissionStatus("pending")).toBe(false);
    expect(isPublicSubmissionStatus("rejected")).toBe(false);
  });

  it("authors and admins can see non-public rows", () => {
    expect(canAuthorSeeSubmission("pending", true, false)).toBe(true);
    expect(canAuthorSeeSubmission("pending", false, true)).toBe(true);
    expect(canAuthorSeeSubmission("pending", false, false)).toBe(false);
    expect(canAuthorSeeSubmission("approved", false, false)).toBe(true);
  });

  it("labels statuses for UI", () => {
    expect(moderationLabel("pending")).toMatch(/Pending/i);
  });

  it("builds certificate deep links", () => {
    expect(buildCertificateVerificationUrl("ABC123", "https://example.com")).toBe(
      "https://example.com/portal/education?cert=ABC123",
    );
  });
});
