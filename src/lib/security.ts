/** Client-side auth input validation (server still enforces via Supabase). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strip ASCII control characters (except tab/newline for multi-line fields). */
function stripControlChars(text: string, allowNewlines = false): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isControl = (code >= 0 && code <= 8) || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127;
    if (isControl) {
      if (allowNewlines && (code === 10 || code === 13)) out += text[i];
      continue;
    }
    out += text[i];
  }
  return out;
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "10minutemail.com",
  "trashmail.com",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return EMAIL_RE.test(trimmed) && trimmed.length <= 254 && !isDisposableEmail(trimmed);
}

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export function assessPassword(password: string): {
  strength: PasswordStrength;
  score: number;
  hints: string[];
} {
  const hints: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else hints.push("At least 8 characters");

  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else hints.push("Mix upper and lower case");

  if (/\d/.test(password)) score += 1;
  else hints.push("Include a number");

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const strength: PasswordStrength =
    score <= 1 ? "weak" : score === 2 ? "fair" : score === 3 ? "good" : "strong";

  return { strength, score, hints };
}

export function isPasswordAcceptable(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

export function sanitizeDisplayName(name: string): string {
  return stripControlChars(name)
    .replace(/<[^>]*>/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export function sanitizeBio(bio: string): string {
  return stripControlChars(bio, true)
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 500);
}

/** Sanitize admin-authored title and summary fields. */
export function sanitizeTextInput(text: string, maxLength = 500): string {
  return stripControlChars(text)
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
}

const BLOCKED_URL_SCHEMES = /^(javascript|data|vbscript|file):/i;

/** Only allow http(s) and relative in-app paths for user-authored markdown links. */
export function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2048) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (BLOCKED_URL_SCHEMES.test(trimmed)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function sanitizeSearchQuery(query: string, maxLength = 80): string {
  return stripControlChars(query).trim().slice(0, maxLength);
}

/** Reject service-role or secret keys accidentally set as client env vars. */
export function isClientSafeSupabaseKey(key: string): boolean {
  const k = key.trim();
  if (!k) return false;
  if (k.includes("service_role") || k.startsWith("sb_secret_")) return false;
  return k.startsWith("eyJ");
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** Prevent open redirects after login — only same-origin relative paths. */
export function safeInternalPath(path: string | undefined, fallback = "/portal"): string {
  if (!path || typeof path !== "string") return fallback;

  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return fallback;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("://") ||
    decoded.includes("\\") ||
    decoded.includes("\0")
  ) {
    return fallback;
  }

  return decoded;
}

const INTEREST_RE = /^[a-z0-9][a-z0-9 _-]{0,31}$/i;

export function sanitizeInterests(interests: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of interests) {
    const tag = raw.trim().toLowerCase().slice(0, 32);
    if (!tag || !INTEREST_RE.test(tag) || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= 12) break;
  }
  return out;
}

const TAG_RE = /^[a-z0-9][a-z0-9 _-]{0,31}$/i;

/** Sanitize comma-separated admin tags. */
export function sanitizeTags(raw: string, max = 12): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const tag = part.trim().toLowerCase().slice(0, 32);
    if (!tag || !TAG_RE.test(tag) || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= max) break;
  }
  return out;
}

/** Return a sanitized http(s) URL or undefined when invalid. */
export function sanitizeOptionalUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  return sanitizeUrl(url) ?? undefined;
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

export function checkLoginRateLimit(email: string): { allowed: boolean; retryAfterSec?: number } {
  if (typeof window === "undefined") return { allowed: true };
  const key = `f4a_login_${email.trim().toLowerCase()}`;
  try {
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const attempts: number[] = raw ? JSON.parse(raw) : [];
    const recent = attempts.filter((t) => now - t < LOGIN_WINDOW_MS);
    if (recent.length >= LOGIN_MAX_ATTEMPTS) {
      const oldest = Math.min(...recent);
      return { allowed: false, retryAfterSec: Math.ceil((LOGIN_WINDOW_MS - (now - oldest)) / 1000) };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordLoginAttempt(email: string): void {
  if (typeof window === "undefined") return;
  const key = `f4a_login_${email.trim().toLowerCase()}`;
  try {
    const now = Date.now();
    const raw = localStorage.getItem(key);
    const attempts: number[] = raw ? JSON.parse(raw) : [];
    const recent = attempts.filter((t) => now - t < LOGIN_WINDOW_MS);
    recent.push(now);
    localStorage.setItem(key, JSON.stringify(recent));
  } catch {
    /* ignore quota errors */
  }
}

export function clearLoginAttempts(email: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`f4a_login_${email.trim().toLowerCase()}`);
  } catch {
    /* ignore */
  }
}

const CONTACT_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_MAX_SUBMISSIONS = 3;

export function checkContactRateLimit(email: string): { allowed: boolean; retryAfterSec?: number } {
  if (typeof window === "undefined") return { allowed: true };
  const key = `f4a_contact_${email.trim().toLowerCase()}`;
  try {
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const attempts: number[] = raw ? JSON.parse(raw) : [];
    const recent = attempts.filter((t) => now - t < CONTACT_WINDOW_MS);
    if (recent.length >= CONTACT_MAX_SUBMISSIONS) {
      const oldest = Math.min(...recent);
      return { allowed: false, retryAfterSec: Math.ceil((CONTACT_WINDOW_MS - (now - oldest)) / 1000) };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordContactSubmission(email: string): void {
  if (typeof window === "undefined") return;
  const key = `f4a_contact_${email.trim().toLowerCase()}`;
  try {
    const now = Date.now();
    const raw = localStorage.getItem(key);
    const attempts: number[] = raw ? JSON.parse(raw) : [];
    const recent = attempts.filter((t) => now - t < CONTACT_WINDOW_MS);
    recent.push(now);
    localStorage.setItem(key, JSON.stringify(recent));
  } catch {
    /* ignore */
  }
}
