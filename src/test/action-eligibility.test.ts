import { describe, expect, it } from "vitest";
import {
  acceptsEventRegistration,
  acceptsLabApplications,
  acceptsOpportunityInterest,
} from "@/lib/actionEligibility";

const NOW = Date.parse("2026-09-08T12:00:00Z");

describe("member action eligibility", () => {
  it("accepts applications only while an open project's deadline is in the future", () => {
    expect(acceptsLabApplications({ status: "open", applicationDeadline: undefined }, NOW)).toBe(true);
    expect(acceptsLabApplications({ status: "open", applicationDeadline: "2026-09-09T00:00:00Z" }, NOW)).toBe(true);
    expect(acceptsLabApplications({ status: "closed", applicationDeadline: undefined }, NOW)).toBe(false);
    expect(acceptsLabApplications({ status: "open", applicationDeadline: "2026-09-08T11:59:59Z" }, NOW)).toBe(false);
  });

  it("accepts opportunity interest only for active, unexpired opportunities", () => {
    expect(acceptsOpportunityInterest({ isActive: true, deadline: undefined }, NOW)).toBe(true);
    expect(acceptsOpportunityInterest({ isActive: false, deadline: undefined }, NOW)).toBe(false);
    expect(acceptsOpportunityInterest({ isActive: true, deadline: "invalid" }, NOW)).toBe(false);
    expect(acceptsOpportunityInterest({ isActive: true, deadline: "2026-09-08T11:59:59Z" }, NOW)).toBe(false);
  });

  it("accepts registration only for upcoming events that have not started", () => {
    expect(acceptsEventRegistration({ status: "upcoming", startsAt: "2026-09-09T00:00:00Z" }, NOW)).toBe(true);
    expect(acceptsEventRegistration({ status: "live", startsAt: "2026-09-08T11:00:00Z" }, NOW)).toBe(false);
    expect(acceptsEventRegistration({ status: "completed", startsAt: "2026-09-07T00:00:00Z" }, NOW)).toBe(false);
  });
});
