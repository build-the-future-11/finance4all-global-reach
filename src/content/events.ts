import type { Event, EventDetails } from "@/types/domain";

export const eventLifecycleLabels = {
  upcoming: "Upcoming", live: "Happening now", completed: "Completed",
  awaiting_schedule: "Awaiting schedule", on_hold: "On hold", cancelled: "Cancelled",
} as const;
export type EventLifecycle = keyof typeof eventLifecycleLabels;
export interface CatalogEvent {
  id: string;
  title: string;
  description: string;
  status: EventLifecycle;
  startsAt?: string;
  endsAt?: string;
  chapterId?: string;
  registrationUrl?: string;
  programLinks: Event["programLinks"];
  details: EventDetails;
  source: "published_event" | "program_plan";
  readinessNote?: string;
}

// These are program launch notices, not published/scheduled event records.
// No private source document, organizer name or speculative timestamp is exposed.
export const eventLaunchNotices: CatalogEvent[] = [
  { id: "finance4-impact-pilots", title: "Finance4 Impact · financial literacy pilots", description: "Small school and community workshops in budgeting, saving and everyday financial decisions.", status: "awaiting_schedule", details: { host: "Finance4All", type: "workshop", relatedProgram: "finance4-impact", audience: "School and community audiences; local permissions required." }, readinessNote: "Host, facilitator, permissions, safeguarding and delivery dates must be confirmed." },
  { id: "open-markets-challenge-001", title: "FinanceMeta Open Markets Challenge 001", description: "Investigate a market hypothesis using documented data, transparent methods and point-in-time controls.", status: "on_hold", details: { host: "FinanceMeta Labs", type: "competition", relatedProgram: "open-markets" }, readinessNote: "The existing registration form does not lift the operational hold. Evaluator capacity, licensed data provisioning and dates remain unconfirmed." },
  { id: "investment-model-challenge-2026", title: "Global Investment Model Challenge 2026", description: "A proposed modeling challenge rewarding explicit assumptions, reproducibility, risk checks and clear limitations.", status: "on_hold", details: { host: "Finance4All", type: "competition", relatedProgram: "investment-model-challenge" }, readinessNote: "Rules, eligibility, submission deadline, timezone and judging team are not frozen. No competition registration is offered." },
  { id: "backtest-falsification-challenge", title: "Backtest Falsification Challenge", description: "A proposed challenge examining leakage, costs, survivorship and other reasons backtests fail. Defensible negative results count.", status: "on_hold", details: { host: "FinanceMeta Labs", type: "competition", relatedProgram: "backtest-falsification" }, readinessNote: "Released data, licensing, evaluation rules, reviewer capacity and schedule are required before launch." },
  { id: "iyern-global-research-challenge", title: "IYERN Global Research Challenge", description: "A proposed research challenge in economics, finance and transparent research methods.", status: "awaiting_schedule", details: { host: "IYERN / FinanceMeta", type: "competition", relatedProgram: "global-research-challenge" }, readinessNote: "Early interest only. No confirmed competition dates, judges, prizes or partner relationship are announced." },
  { id: "quant-arena-2026", title: "FinanceMeta Quant Arena 2026", description: "A planned markets competition centered on evidence, reasoning, risk and defending a decision under changing information.", status: "on_hold", details: { host: "FinanceMeta", type: "competition", relatedProgram: "quantitative-markets" }, readinessNote: "The fall launch plan proposes a format, but a frozen round calendar, rules, judges and authorized signup were not verified." },
  { id: "fintech-studio-buildathon", title: "FinTech Studio Buildathon", description: "A planned build sprint for functional finance tools with testable artifacts and honest evaluation.", status: "on_hold", details: { host: "FinanceMeta", type: "competition", modality: "online", relatedProgram: "fintech-studio" }, readinessNote: "November 2026 is a planning window, not a confirmed schedule. Exact dates, rules and management approval remain pending." },
].map(item => ({ ...item, status: item.status as EventLifecycle, details: { ...item.details, verifiedAt: "2026-10-16" } as EventDetails, programLinks: [], source: "program_plan" }));

export function toCatalogEvent(event: Event): CatalogEvent {
  return { ...event, details: event.details ?? {}, source: "published_event" };
}

// A reviewed replacement names its program notice; no fuzzy title matching can
// accidentally merge unrelated events or invent a relationship.
export function mergeEventCatalog(events: Event[]): CatalogEvent[] {
  const published = events.map(toCatalogEvent);
  const confirmedPrograms = new Set(published.map(event => event.details.relatedProgram).filter(Boolean));
  return [...published, ...eventLaunchNotices.filter(event => !confirmedPrograms.has(event.details.relatedProgram))];
}
