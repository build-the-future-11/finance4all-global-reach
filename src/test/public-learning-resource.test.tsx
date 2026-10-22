import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Learn from "@/pages/learn/Learn";
import FiveFoundations from "@/pages/learn/FiveFoundations";

function renderWithRouter(element: React.ReactElement) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe("public FinanceMeta learning resources", () => {
  it("publishes a discoverable free-resource hub without implying external endorsement", () => {
    renderWithRouter(<Learn />);

    expect(screen.getByRole("heading", { level: 1, name: /Build understanding.\s*One question at a time./i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Five Foundations/ })).toBeInTheDocument();
    expect(screen.getByText(/35 minutes · Self-directed/)).toBeInTheDocument();
    expect(screen.getByText(/Every resource here is free to read/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Five Foundations/ })).toHaveAttribute("href", "/learn/five-foundations");
    expect(screen.getByText(/No security, lender, broker or individualized financial action is recommended/)).toBeInTheDocument();
  });

  it("renders the complete Five Foundations lesson and keeps the advice boundary explicit", () => {
    renderWithRouter(<FiveFoundations />);

    expect(screen.getByRole("heading", { level: 1, name: "Five Foundations" })).toBeInTheDocument();
    expect(screen.getByText(/general financial education, not financial advice/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /35-minute run of show/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /five questions/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /worked answers/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /2021 national standards alignment/i })).toBeInTheDocument();
  });

  it("preserves the exact-real-return correction and diversification limitation", () => {
    renderWithRouter(<FiveFoundations />);

    expect(screen.getByText(/1\.03 \/ 1\.05 = 0\.98095/)).toBeInTheDocument();
    expect(screen.getByText(/approximation, not an exact identity/i)).toBeInTheDocument();
    expect(screen.getByText(/does not guarantee a profit and does not eliminate losses from broad market declines/i)).toBeInTheDocument();
  });

  it("distinguishes APR from interest rate and refuses guaranteed-return framing", () => {
    renderWithRouter(<FiveFoundations />);

    expect(screen.getByText(/APR is a broader comparison measure that incorporates the interest rate and certain additional loan fees/i)).toBeInTheDocument();
    expect(screen.getByText(/expected return is not guaranteed return/i)).toBeInTheDocument();
  });

  it("exposes standards and primary accuracy sources as external references", () => {
    renderWithRouter(<FiveFoundations />);

    const standardsSection = screen.getByRole("heading", { name: /2021 national standards alignment/i }).closest("section");
    expect(standardsSection).not.toBeNull();
    expect(within(standardsSection!).getByText("Saving 8-5; Investing 8-7")).toBeInTheDocument();
    expect(within(standardsSection!).getByText("Investing 12-3")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /consumer financial protection bureau/i })).toHaveAttribute(
      "href",
      "https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/",
    );
    expect(screen.getByRole("link", { name: /sec investor\.gov — diversify your investments/i })).toHaveAttribute(
      "href",
      "https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/diversify-your-investments",
    );
  });
});
