/** Lightweight, privacy-conscious client analytics. No PII in event properties. */

export type AnalyticsProperties = Record<string, string | number | boolean>;

export interface AnalyticsEvent {
  name: string;
  properties?: AnalyticsProperties;
}

const MAX_QUEUE = 50;
const queue: AnalyticsEvent[] = [];

const ANALYTICS_PROVIDER = import.meta.env.VITE_ANALYTICS_PROVIDER?.trim();
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN?.trim();

function devLog(event: AnalyticsEvent) {
  if (import.meta.env.DEV) {
    console.debug("[analytics]", event.name, event.properties ?? {});
  }
}

function persistEvent(event: AnalyticsEvent) {
  queue.push(event);
  if (queue.length > MAX_QUEUE) queue.shift();
  try {
    const key = "f4a-analytics-recent";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as AnalyticsEvent[];
    existing.push({ ...event, properties: { ...event.properties, ts: Date.now() } });
    localStorage.setItem(key, JSON.stringify(existing.slice(-MAX_QUEUE)));
  } catch {
    /* ignore storage failures */
  }
}

function forwardToProvider(name: string, properties?: AnalyticsProperties) {
  if (import.meta.env.DEV) return;

  if (ANALYTICS_PROVIDER === "plausible" && PLAUSIBLE_DOMAIN) {
    const w = window as Window & { plausible?: (event: string, opts?: { props: AnalyticsProperties }) => void };
    w.plausible?.(name, properties ? { props: properties } : undefined);
    return;
  }

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim();
  if (endpoint) {
    const body = JSON.stringify({ name, properties, ts: Date.now() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      void fetch(endpoint, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  }
}

/** Track a product event. Never pass emails, names, or free-text user content. */
export function trackEvent(name: string, properties?: AnalyticsProperties) {
  const event: AnalyticsEvent = { name, properties };
  devLog(event);
  persistEvent(event);
  forwardToProvider(name, properties);
}

export function getRecentAnalyticsEvents(): AnalyticsEvent[] {
  return [...queue];
}
