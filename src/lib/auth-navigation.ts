const POST_AUTH_PATH_KEY = "financemeta.postAuthPath";
const PORTAL_ORIGIN = "https://portal.financemeta.invalid";

export interface AuthCallbackError {
  code: string;
  message: string;
}

export function sanitizePostAuthPath(value: unknown, fallback = "/portal") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(value, PORTAL_ORIGIN);
    if (url.origin !== PORTAL_ORIGIN || !url.pathname.startsWith("/portal")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function rememberPostAuthPath(value: unknown) {
  if (typeof window === "undefined") return;
  const path = sanitizePostAuthPath(value);
  window.sessionStorage.setItem(POST_AUTH_PATH_KEY, path);
}

export function takePostAuthPath() {
  if (typeof window === "undefined") return "/portal";
  const stored = window.sessionStorage.getItem(POST_AUTH_PATH_KEY);
  window.sessionStorage.removeItem(POST_AUTH_PATH_KEY);
  return sanitizePostAuthPath(stored);
}

export function readAuthCallbackError(search: string, hash: string): AuthCallbackError | null {
  const candidates = [new URLSearchParams(search), new URLSearchParams(hash.replace(/^#/, ""))];

  for (const params of candidates) {
    const error = params.get("error");
    const code = params.get("error_code") ?? error;
    const description = params.get("error_description");
    if (!code && !description) continue;

    if (code === "signup_disabled") {
      return {
        code,
        message: "New member signup is currently closed. Existing members can still sign in.",
      };
    }

    return {
      code: code ?? "authentication_error",
      message: description?.trim() || "Authentication could not be completed. Please try again.",
    };
  }

  return null;
}
