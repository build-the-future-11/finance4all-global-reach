/**
 * Resolves the app origin for OAuth redirects.
 * In production, never fall back to localhost — use VITE_APP_URL if the browser
 * origin is local (misconfigured Supabase Site URL can cause localhost redirects).
 */
export function getAppOrigin(): string {
  if (typeof window === "undefined") return "";

  const browserOrigin = window.location.origin.replace(/\/$/, "");

  if (import.meta.env.PROD) {
    const configured = import.meta.env.VITE_APP_URL?.trim().replace(/\/$/, "");
    if (configured?.startsWith("https://")) return configured;

    if (
      browserOrigin.includes("localhost") ||
      browserOrigin.includes("127.0.0.1") ||
      browserOrigin === "null"
    ) {
      console.error(
        "[FinanceMeta] Production build on localhost — set VITE_APP_URL to your Vercel URL.",
      );
    }
  }

  return browserOrigin;
}

export function getAuthCallbackUrl(): string {
  return `${getAppOrigin()}/auth/callback`;
}

export function getResetPasswordUrl(): string {
  return `${getAppOrigin()}/reset-password`;
}

export function parseAuthHashError(): string | null {
  const hash = window.location.hash?.replace(/^#/, "");
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const description = params.get("error_description") ?? params.get("error");
  if (!description) return null;

  return decodeURIComponent(description.replace(/\+/g, " "));
}
