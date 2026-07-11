import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("deployment security config", () => {
  const vercel = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8")) as {
    headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
  };

  const globalHeaders = vercel.headers.find((h) => h.source === "/(.*)")?.headers ?? [];
  const headerMap = Object.fromEntries(globalHeaders.map((h) => [h.key, h.value]));
  const csp = headerMap["Content-Security-Policy"] ?? "";

  it("enforces HSTS", () => {
    expect(headerMap["Strict-Transport-Security"]).toContain("max-age=");
    expect(headerMap["Strict-Transport-Security"]).toContain("includeSubDomains");
  });

  it("blocks framing and object embeds", () => {
    expect(headerMap["X-Frame-Options"]).toBe("DENY");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it("restricts script and connect sources", () => {
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("https://*.supabase.co");
  });

  it("upgrades insecure requests", () => {
    expect(csp).toContain("upgrade-insecure-requests");
  });
});
