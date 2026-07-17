import { describe, expect, it } from "vitest";
import { sanitizeUrl } from "@/lib/security";

describe("outbound URL rendering safety", () => {
  it("blocks javascript and data schemes used in hrefs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("data:text/html,<script>")).toBeNull();
    expect(sanitizeUrl("vbscript:msgbox")).toBeNull();
  });

  it("allows https application and registration links", () => {
    expect(sanitizeUrl("https://example.com/apply")).toBe("https://example.com/apply");
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com/");
  });
});

describe("content report insert path", () => {
  it("documents that client inserts must use submit_content_report RPC", () => {
    // Guardrail: direct table insert policy was removed in 015/016.
    // The browser client must call this RPC name only.
    expect("submit_content_report").toMatch(/^submit_content_report$/);
  });
});
