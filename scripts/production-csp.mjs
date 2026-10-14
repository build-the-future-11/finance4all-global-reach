// Narrow verifier for this repository's single-policy production contract.
// This is not a general browser CSP evaluator or an application security audit.
// Parsing reference: https://www.w3.org/TR/CSP/#parse-serialized-policy
export function verifyContentSecurityPolicy(value) {
  const fail = (message) => {
    throw new Error(`[production-health] content-security-policy ${message}`);
  };
  if (typeof value !== "string" || value.length === 0) fail("is missing");
  // Multiple enforcement policies combine restrictively in browsers. Do not
  // accidentally flatten their directives into a different single policy.
  // The deployed repository contract emits one policy; other forms need review.
  if (value.includes(",")) fail("must be one policy; combined policies require separate review");

  const directives = new Map();
  const asciiLower = (text) => text.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  for (const segment of value.split(";")) {
    const token = segment.replace(/^[\t\n\f\r ]+|[\t\n\f\r ]+$/g, "");
    if (!token) continue;
    const [rawName, ...sources] = token.split(/[\t\n\f\r ]+/);
    const name = asciiLower(rawName);
    // CSP ignores later occurrences, even when the earlier value is empty.
    if (!directives.has(name)) directives.set(name, sources);
  }

  for (const [name, expected] of [
    ["default-src", "'self'"],
    ["frame-ancestors", "'none'"],
    ["object-src", "'none'"],
  ]) {
    const sources = directives.get(name);
    if (!sources || sources.length !== 1 || asciiLower(sources[0]) !== expected) {
      fail(`effective ${name} must contain only ${expected}`);
    }
  }

  const connectionSources = directives.get("connect-src") ?? [];
  for (const expected of [
    "https://pnemeegkwyaicsbnbnmg.supabase.co",
    "wss://pnemeegkwyaicsbnbnmg.supabase.co",
  ]) {
    if (!connectionSources.includes(expected)) {
      fail(`effective connect-src is missing exact source ${expected}`);
    }
  }
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(value)) {
    fail("still permits third-party font infrastructure");
  }
  return value;
}
