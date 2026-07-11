import { describe, it, expect, beforeEach } from "vitest";
import { getRecentAnalyticsEvents, trackEvent } from "@/lib/analytics";

describe("analytics", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("records events in memory", () => {
    trackEvent("auth.sign_in", { method: "email" });
    const events = getRecentAnalyticsEvents();
    expect(events.some((e) => e.name === "auth.sign_in")).toBe(true);
  });

  it("persists recent events to localStorage", () => {
    trackEvent("contact.submit", { source: "landing" });
    const stored = JSON.parse(localStorage.getItem("f4a-analytics-recent") ?? "[]") as { name: string }[];
    expect(stored.some((e) => e.name === "contact.submit")).toBe(true);
  });
});
