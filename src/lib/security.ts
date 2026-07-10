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
