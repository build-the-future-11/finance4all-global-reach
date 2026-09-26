export interface PublicAuthSettings {
  signupsEnabled: boolean;
  emailEnabled: boolean;
  googleEnabled: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePublicAuthSettings(value: unknown): PublicAuthSettings | null {
  if (!isRecord(value) || typeof value.disable_signup !== "boolean" || !isRecord(value.external)) {
    return null;
  }
  const external = value.external;
  if ([external.email, external.google].some((provider) => provider !== undefined && typeof provider !== "boolean")) {
    return null;
  }
  return {
    signupsEnabled: !value.disable_signup,
    emailEnabled: external.email === true,
    googleEnabled: external.google === true,
  };
}

/** Bound both headers and JSON-body reads; unknown settings never imply provider status. */
export async function fetchPublicAuthSettings(
  url: string,
  key: string,
  options: { fetcher?: typeof fetch; timeoutMs?: number } = {},
): Promise<PublicAuthSettings | null> {
  if (!url || !key) return null;
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 8_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return null;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const request = (async () => {
      const response = await fetcher(`${url.replace(/\/+$/, "")}/auth/v1/settings`, {
        headers: { apikey: key },
        signal: controller.signal,
      });
      if (!response.ok) return null;
      return parsePublicAuthSettings(await response.json());
    })();
    const deadline = new Promise<null>((resolve) => {
      timer = setTimeout(() => {
        controller.abort();
        resolve(null);
      }, timeoutMs);
    });
    return await Promise.race([request, deadline]);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
