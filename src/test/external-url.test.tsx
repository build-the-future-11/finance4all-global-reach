import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MarkdownContent from "@/components/portal/MarkdownContent";
import {
  normalizeExternalHttpUrl,
  requireOptionalExternalHttpUrl,
} from "@/lib/external-url";
import { NewsArticleSchema } from "@/types/domain";

describe("external URL trust boundary", () => {
  it("accepts only credential-free HTTP(S) URLs", () => {
    expect(normalizeExternalHttpUrl(" https://example.com/path ")).toBe("https://example.com/path");
    expect(normalizeExternalHttpUrl("javascript:alert(1)")).toBeUndefined();
    expect(normalizeExternalHttpUrl("data:text/html,unsafe")).toBeUndefined();
    expect(normalizeExternalHttpUrl("https://user:secret@example.com")).toBeUndefined();
    expect(normalizeExternalHttpUrl("/relative")).toBeUndefined();
  });

  it("rejects unsafe optional values before a database write", () => {
    expect(requireOptionalExternalHttpUrl("", "Demo URL")).toBeUndefined();
    expect(() => requireOptionalExternalHttpUrl("javascript:alert(1)", "Demo URL")).toThrow(
      /Demo URL must be a valid http or https URL/,
    );
  });

  it("keeps domain schemas aligned with the runtime URL policy", () => {
    const article = {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Example",
      summary: "Example",
      category: "macro",
      publishedAt: "2026-09-06T00:00:00.000Z",
      tags: [],
    };

    expect(NewsArticleSchema.safeParse({ ...article, sourceUrl: "https://example.com" }).success).toBe(true);
    expect(NewsArticleSchema.safeParse({ ...article, sourceUrl: "javascript:alert(1)" }).success).toBe(false);
  });

  it("renders unsafe Markdown link targets as text", () => {
    const { container, rerender } = render(
      <MarkdownContent content="[Unsafe](data:text/html,unsafe)" />,
    );
    expect(container).toHaveTextContent("Unsafe");
    expect(container.querySelector("a")).toBeNull();

    rerender(<MarkdownContent content="[Safe](https://example.com/docs)" />);
    expect(screen.getByRole("link", { name: "Safe" })).toHaveAttribute(
      "href",
      "https://example.com/docs",
    );
  });
});
