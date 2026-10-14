import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({})) }));

let getPublicAuthSettings: typeof import("@/lib/supabase").getPublicAuthSettings;

beforeAll(async () => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://pnemeegkwyaicsbnbnmg.supabase.co");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_settings_fixture");
  ({ getPublicAuthSettings } = await import("@/lib/supabase"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("public auth settings", () => {
  it("retains explicitly enabled and disabled provider settings", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      disable_signup: true,
      external: { email: true, google: false },
      additional_provider_metadata: "ignored",
    })));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublicAuthSettings()).resolves.toEqual({
      signupsEnabled: false, emailEnabled: true, googleEnabled: false,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://pnemeegkwyaicsbnbnmg.supabase.co/auth/v1/settings",
      expect.objectContaining({ headers: { apikey: "sb_publishable_settings_fixture" } }),
    );
  });

  it.each([
    null, [], {}, "unavailable", 0,
    { disable_signup: "false", external: { email: true, google: true } },
    { disable_signup: false, external: { email: "true", google: true } },
    { disable_signup: false, external: { email: true, google: 1 } },
    { disable_signup: false, external: [] },
    { disable_signup: false },
  ])("keeps malformed settings unknown rather than disabling signup methods: %j", async (value) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(value))));
    await expect(getPublicAuthSettings()).resolves.toBeNull();
  });

  it("bounds a connection that never returns headers and aborts its transport", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    vi.stubGlobal("fetch", vi.fn((_input, init) => {
      signal = init.signal;
      return new Promise(() => undefined);
    }));
    let settled = false;
    const pending = getPublicAuthSettings().then((result) => { settled = true; return result; });
    await vi.advanceTimersByTimeAsync(15_000);
    expect(settled).toBe(true);
    await expect(pending).resolves.toBeNull();
    expect(signal?.aborted).toBe(true);
  });

  it("keeps the deadline active through a body that never finishes", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    vi.stubGlobal("fetch", vi.fn(async (_input, init) => {
      signal = init.signal;
      return { ok: true, json: () => new Promise(() => undefined) };
    }));
    let settled = false;
    const pending = getPublicAuthSettings().then((result) => { settled = true; return result; });
    await vi.advanceTimersByTimeAsync(15_000);
    expect(settled).toBe(true);
    await expect(pending).resolves.toBeNull();
    expect(signal?.aborted).toBe(true);
  });

  it("releases an unread HTTP error body and leaves provider settings unknown", async () => {
    const cancel = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 503, body: { cancel },
    }));
    await expect(getPublicAuthSettings()).resolves.toBeNull();
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("cleans up the deadline after a normal response", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      disable_signup: false, external: { email: true, google: true },
    }))));
    await expect(getPublicAuthSettings()).resolves.toEqual({
      signupsEnabled: true, emailEnabled: true, googleEnabled: true,
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});
