import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeEach } from "vitest";
import { getRecentAnalyticsEvents, trackEvent, PRODUCT_EVENT_NAMES } from "@/lib/analytics";

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

  it("keeps the client allowlist in sync with the track_product_event DB allowlist", () => {
    const migration = readFileSync(
      resolve(__dirname, "../../supabase/migrations/021_analytics_journey_events.sql"),
      "utf8",
    );
    const dbAllowlist = Array.from(migration.matchAll(/'([a-z]+\.[a-z_]+)'/g)).map((m) => m[1]);
    for (const name of PRODUCT_EVENT_NAMES) {
      expect(dbAllowlist).toContain(name);
    }
    for (const name of dbAllowlist) {
      expect(PRODUCT_EVENT_NAMES as readonly string[]).toContain(name);
    }
  });
});
