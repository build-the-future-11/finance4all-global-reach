import { describe, expect, it } from "vitest";
import { getEventRegistrationState } from "@/lib/eventRegistration";
import type { Event } from "@/types/domain";

const event: Event = {
  id: "00000000-0000-4000-8000-000000000001",
  chapterId: "00000000-0000-4000-8000-000000000002",
  title: "Markets discussion",
  description: "A discussion.",
  status: "upcoming",
  startsAt: "2026-08-02T10:00:00.000Z",
  programLinks: [],
};

describe("getEventRegistrationState", () => {
  it("blocks registrations before their opening time", () => {
    expect(getEventRegistrationState({ ...event, registrationOpensAt: "2026-08-01T10:00:00.000Z" }, new Date("2026-07-31T10:00:00.000Z"))).toEqual({ open: false, reason: "Registration has not opened" });
  });

  it("blocks registrations after close and event start", () => {
    expect(getEventRegistrationState({ ...event, registrationClosesAt: "2026-08-01T10:00:00.000Z" }, new Date("2026-08-01T10:00:00.000Z"))).toEqual({ open: false, reason: "Registration is closed" });
    expect(getEventRegistrationState(event, new Date("2026-08-02T10:00:00.000Z"))).toEqual({ open: false, reason: "Registration is closed" });
  });

  it("allows an upcoming event inside its registration window", () => {
    expect(getEventRegistrationState(event, new Date("2026-08-01T10:00:00.000Z"))).toEqual({ open: true });
  });
});
