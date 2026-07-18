import { isSupabaseConfigured, supabase } from "@/lib/supabase";

/** Product events contain only bounded, non-PII scalar properties. */
export const PRODUCT_EVENT_NAMES = [
  "auth.onboarding_completed",
  "auth.sign_in",
  "auth.sign_out",
  "auth.sign_up",
  "contact.submit",
  "content.saved",
  "education.lesson_complete",
  "education.certificate_issued",
  "event.registered",
  "opportunity.interest_saved",
  "research.application_submitted",
  "research.application_decided",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];
export type AnalyticsProperties = Record<string, string | number | boolean>;

export interface AnalyticsEvent {
  name: ProductEventName;
  properties?: AnalyticsProperties;
}

const MAX_QUEUE = 50;
const queue: AnalyticsEvent[] = [];

function persistEvent(event: AnalyticsEvent) {
  queue.push(event);
  if (queue.length > MAX_QUEUE) queue.shift();
  try {
    const key = "f4a-analytics-recent";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as AnalyticsEvent[];
    existing.push(event);
    localStorage.setItem(key, JSON.stringify(existing.slice(-MAX_QUEUE)));
  } catch {
    // Analytics must never interfere with the member's task.
  }
}

/** Track a product event. Never pass emails, names, URLs, or free-text content. */
export function trackEvent(name: ProductEventName, properties?: AnalyticsProperties) {
  const event: AnalyticsEvent = { name, properties };
  persistEvent(event);

  if (import.meta.env.DEV) {
    console.debug("[analytics]", event.name, event.properties ?? {});
    return;
  }
  if (!isSupabaseConfigured) return;

  void supabase.rpc("track_product_event", {
    p_event_name: name,
    p_properties: properties ?? {},
  });
}

export function getRecentAnalyticsEvents(): AnalyticsEvent[] {
  return [...queue];
}
