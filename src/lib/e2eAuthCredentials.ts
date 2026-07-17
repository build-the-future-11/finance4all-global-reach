/**
 * Helpers for authenticated Playwright journeys.
 * Credentials come from env — never hardcode secrets.
 */

export function hasE2ECredentials(
  email = typeof process !== "undefined" ? process.env.E2E_EMAIL : undefined,
  password = typeof process !== "undefined" ? process.env.E2E_PASSWORD : undefined,
): boolean {
  return Boolean(email?.trim() && password?.trim());
}

export function e2eAuthSkipReason(): string {
  return "Set E2E_EMAIL and E2E_PASSWORD to run authenticated portal journeys against a live/staging project.";
}
