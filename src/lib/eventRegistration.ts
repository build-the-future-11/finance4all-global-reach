import type { Event } from "@/types/domain";

export type EventRegistrationState = {
  open: boolean;
  reason?: string;
};

export function getEventRegistrationState(event: Event, now = new Date()): EventRegistrationState {
  if (event.status !== "upcoming" || new Date(event.startsAt) <= now) {
    return { open: false, reason: "Registration is closed" };
  }
  if (event.registrationOpensAt && new Date(event.registrationOpensAt) > now) {
    return { open: false, reason: "Registration has not opened" };
  }
  if (event.registrationClosesAt && new Date(event.registrationClosesAt) <= now) {
    return { open: false, reason: "Registration is closed" };
  }
  return { open: true };
}
