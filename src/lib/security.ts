/** Client-side auth input validation (server still enforces via Supabase). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.length <= 254;
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
  return name.trim().replace(/\s+/g, " ").slice(0, 80);
}

export function sanitizeBio(bio: string): string {
  return bio.trim().slice(0, 500);
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
  return query.replace(/[\x00-\x1f\x7f]/g, "").trim().slice(0, maxLength);
}

/** Reject service-role or secret keys accidentally set as client env vars. */
export function isClientSafeSupabaseKey(key: string): boolean {
  const k = key.trim();
  if (!k) return false;
  if (k.includes("service_role") || k.startsWith("sb_secret_")) return false;
  return k.startsWith("eyJ") || k.startsWith("sb_publishable_");
}

/** Prevent open redirects after login — only same-origin relative paths. */
export function safeInternalPath(path: string | undefined, fallback = "/portal"): string {
  if (!path || typeof path !== "string") return fallback;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) return fallback;
  return path;
}
