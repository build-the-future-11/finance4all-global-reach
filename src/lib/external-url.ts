const ALLOWED_EXTERNAL_PROTOCOLS = new Set(["http:", "https:"]);

export function normalizeExternalHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const candidate = value.trim();
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    if (!ALLOWED_EXTERNAL_PROTOCOLS.has(url.protocol)) return undefined;
    if (url.username || url.password) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function requireOptionalExternalHttpUrl(
  value: unknown,
  label = "URL",
): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;

  const normalized = normalizeExternalHttpUrl(value);
  if (!normalized) {
    throw new Error(`${label} must be a valid http or https URL without embedded credentials.`);
  }
  return normalized;
}
