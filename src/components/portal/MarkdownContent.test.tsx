import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkdownContent from "@/components/portal/MarkdownContent";

describe("MarkdownContent", () => {
  it("renders safe internal links", () => {
    render(<MarkdownContent content="Read [Education](/portal/education) today." />);
    const link = screen.getByRole("link", { name: "Education" });
    expect(link).toHaveAttribute("href", "/portal/education");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external https links in a new tab", () => {
    render(<MarkdownContent content="See [SEC](https://www.sec.gov) filings." />);
    const link = screen.getByRole("link", { name: "SEC" });
    expect(link).toHaveAttribute("href", "https://www.sec.gov/");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("strips javascript: URLs and shows link text only", () => {
    render(<MarkdownContent content="Click [evil](javascript:alert(1)) here." />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/evil/)).toBeInTheDocument();
  });

  it("does not render raw HTML tags from content", () => {
    render(<MarkdownContent content={'<img src=x onerror=alert(1)> **Bold** text'} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Bold")).toBeInTheDocument();
  });
});
