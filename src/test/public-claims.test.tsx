import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import HeroSection from "@/components/HeroSection";
import ProgramsSection from "@/components/ProgramsSection";

describe("public evidence boundary", () => {
  it("labels the program catalog as planned and omits unsupported scale claims", () => {
    const { container } = render(
      <MemoryRouter>
        <HeroSection />
        <ProgramsSection />
      </MemoryRouter>,
    );

    expect(screen.getByText(/programs stay marked as planned/i)).toBeInTheDocument();

    const researchLabsLabel = screen.getByText("Fall research labs");
    expect(researchLabsLabel.parentElement).toHaveTextContent("2");

    const intakeLabel = screen.getByText("Program intake");
    expect(intakeLabel.parentElement).toHaveTextContent("Open");

    const evidenceLabel = screen.getByText("Before outcomes");
    expect(evidenceLabel.parentElement).toHaveTextContent("Evidence");

    expect(container.textContent).not.toMatch(/25,000|15\+|50\+|Jane Street|Stanford|Harvard|KFC/);
  });
});
