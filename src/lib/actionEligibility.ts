import type { Event, Opportunity, ResearchProject } from "@/types/domain";

function isFuture(value: string | undefined, nowMs: number) {
  if (!value) return true;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp > nowMs;
}

export function acceptsLabApplications(
  project: Pick<ResearchProject, "status" | "applicationDeadline">,
  nowMs = Date.now(),
) {
  return project.status === "open" && isFuture(project.applicationDeadline, nowMs);
}

export function acceptsOpportunityInterest(
  opportunity: Pick<Opportunity, "isActive" | "deadline">,
  nowMs = Date.now(),
) {
  return opportunity.isActive && isFuture(opportunity.deadline, nowMs);
}

export function acceptsEventRegistration(
  event: Pick<Event, "status" | "startsAt">,
  nowMs = Date.now(),
) {
  return event.status === "upcoming" && isFuture(event.startsAt, nowMs);
}
