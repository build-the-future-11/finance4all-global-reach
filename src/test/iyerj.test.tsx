import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Iyerj from "@/pages/Iyerj";

afterEach(cleanup);

describe("IYERJ information page", () => {
  it("sets its title and exposes one main heading", () => {
    render(<Iyerj />);
    expect(document.title).toBe("IYERJ — Journal & Research Forum · Finance for All");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });
  it("retains the planned first edition without claiming publication", () => {
    const { container } = render(<Iyerj />);
    expect(container.querySelector("time")?.getAttribute("datetime")).toBe("2026-12-01");
    expect(screen.getByText(/Planned publication date/)).toBeTruthy();
    expect(screen.getByText(/This page does not accept manuscripts/)).toBeTruthy();
  });
  it("shows exactly four distinct research forum categories", () => {
    render(<Iyerj />);
    const forum = screen.getByRole("region", { name: "Four ways into the conversation." });
    expect(within(forum).getAllByRole("article")).toHaveLength(4);
    for (const name of ["Quantitative Finance & Econometrics", "Macroeconomics & Public Policy", "Development Economics & Financial Inclusion", "Behavioral Economics & Decision Science"]) {
      expect(within(forum).getByRole("heading", { name })).toBeTruthy();
    }
    expect(within(forum).getAllByText("Posting not yet open")).toHaveLength(4);
  });
  it("does not expose unconnected collection or publication actions", () => {
    const { container } = render(<Iyerj />);
    expect(container.querySelectorAll("form,input,textarea,iframe,script")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /submit|upload|publish|apply/i })).toBeNull();
    expect(screen.getByText("Applications coming soon")).toBeTruthy();
    expect(screen.getByText("In planning")).toBeTruthy();
  });
  it("keeps all fragment links resolvable and editorial questions distinct from intake", () => {
    const { container } = render(<Iyerj />);
    for (const anchor of container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      expect(container.querySelector(anchor.getAttribute("href")!)).not.toBeNull();
    }
    expect(screen.getByRole("link", { name: "Ask an editorial question" }).getAttribute("href")).toBe("mailto:financeforalledu@gmail.com?subject=IYERJ%20editorial%20question");
    expect(screen.getByText(/Forum posting is not journal acceptance/)).toBeTruthy();
  });
});
