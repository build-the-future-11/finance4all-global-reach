/** Map Supabase auth errors to clearer member-facing messages. */

export function formatAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "Incorrect email or password. Try again or reset your password.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirm your email before signing in. Check your inbox for the verification link.";
  }
  if (m.includes("user already registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (m.includes("password should be at least")) {
    return "Password must be at least 8 characters with letters and numbers.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (m.includes("fetch") || m.includes("network")) {
    return "Could not reach the auth server. Check your connection and try again.";
  }
  if (m.includes("signup is disabled")) {
    return "New signups are temporarily disabled. Contact your chapter lead.";
  }

  return message;
}
