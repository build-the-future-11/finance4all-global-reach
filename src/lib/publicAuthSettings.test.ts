import { describe, expect, it } from "vitest";
import { fetchPublicAuthSettings, parsePublicAuthSettings } from "./publicAuthSettings";

const url = "https://example.supabase.co";
const key = "sb_publishable_test_only";
const settings = { disable_signup: false, external: { email: true, google: false } };

describe("public Supabase auth settings", () => {
  it("parses provider flags without conflating email availability with signup permission", () => {
    expect(parsePublicAuthSettings(settings)).toEqual({ signupsEnabled: true, emailEnabled: true, googleEnabled: false });
    expect(parsePublicAuthSettings({ ...settings, disable_signup: true })).toEqual({ signupsEnabled: false, emailEnabled: true, googleEnabled: false });
  });

  it.each([null, {}, [], { external: {} }, { disable_signup: "false", external: {} }, { disable_signup: false, external: null }, { disable_signup: false, external: { google: "true" } }])(
    "keeps malformed settings unknown: %j", (value) => {
      expect(parsePublicAuthSettings(value)).toBeNull();
    },
  );

  it("uses the settings endpoint with exactly one slash and the public API key", async () => {
    let requestUrl: string | undefined;
    let requestHeaders: Headers | undefined;
    const fetcher: typeof fetch = async (input, init) => {
      requestUrl = String(input);
      requestHeaders = new Headers(init?.headers);
      return new Response(JSON.stringify(settings));
    };
    expect(await fetchPublicAuthSettings(`${url}/`, key, { fetcher })).toEqual(parsePublicAuthSettings(settings));
    expect(requestUrl).toBe(`${url}/auth/v1/settings`);
    expect(requestHeaders?.get("apikey")).toBe(key);
  });

  it("returns unknown on HTTP and network failures", async () => {
    const unavailable: typeof fetch = async () => new Response("", { status: 503 });
    const offline: typeof fetch = async () => { throw new Error("offline"); };
    expect(await fetchPublicAuthSettings(url, key, { fetcher: unavailable })).toBeNull();
    expect(await fetchPublicAuthSettings(url, key, { fetcher: offline })).toBeNull();
  });

  it("returns unknown for malformed JSON", async () => {
    const fetcher: typeof fetch = async () => new Response("not-json");
    expect(await fetchPublicAuthSettings(url, key, { fetcher })).toBeNull();
  });

  it("aborts and settles a fetch that never returns", async () => {
    let signal: AbortSignal | null | undefined;
    const fetcher: typeof fetch = (_input, init) => {
      signal = init?.signal;
      return new Promise<Response>(() => {});
    };
    expect(await fetchPublicAuthSettings(url, key, { fetcher, timeoutMs: 10 })).toBeNull();
    expect(signal?.aborted).toBe(true);
  });

  it("includes body parsing in the deadline", async () => {
    const response = new Response("");
    Object.defineProperty(response, "json", { value: () => new Promise<unknown>(() => {}) });
    const fetcher: typeof fetch = async () => response;
    expect(await fetchPublicAuthSettings(url, key, { fetcher, timeoutMs: 10 })).toBeNull();
  });
});
