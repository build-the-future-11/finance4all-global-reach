import { describe, it, expect } from "vitest";
import { sanitizeNewsInput } from "@/lib/adminSanitize";

describe("adminSanitize", () => {
  it("strips unsafe news source URLs", () => {
    const result = sanitizeNewsInput({
      title: "  Fed <b>rates</b>  ",
      summary: "Summary text",
      category: "macro",
      tags: ["Macro", "rates"],
      sourceUrl: "javascript:alert(1)",
    });
    expect(result.title).toBe("Fed rates");
    expect(result.tags).toEqual(["macro", "rates"]);
    expect(result.sourceUrl).toBeUndefined();
    expect(result.isPublished).toBe(false);
  });

  it("keeps valid https source URLs", () => {
    const result = sanitizeNewsInput({
      title: "Headline",
      summary: "Summary",
      category: "markets",
      tags: [],
      sourceUrl: "https://example.com/article",
    });
    expect(result.sourceUrl).toBe("https://example.com/article");
    expect(result.status).toBe("draft");
  });
});
