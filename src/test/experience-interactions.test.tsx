import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorldMap from "@/components/experience/WorldMap";
import { MorphingTabs, Lens, MultiStepLoader } from "@/components/experience/Interactions";
import { communityLocations } from "@/content/community";
import { isOnboardingComplete, validateEducation } from "@/lib/onboarding";

describe("community map", () => {
  it("keeps geographic points, search results, selection, and reset synchronized", () => {
    const { container } = render(<WorldMap locations={communityLocations} />);
    const map = screen.getByRole("group", { name: /interactive world map/i });
    expect(within(map).getAllByRole("button")).toHaveLength(communityLocations.length);
    fireEvent.change(screen.getByRole("textbox", { name: "Find a city or country" }), { target: { value: "Tokyo" } });
    expect(within(map).getAllByRole("button")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Explore Tokyo, Japan", exact: true }));
    expect(screen.getByRole("button", { name: "Tokyo, Japan", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(map).toHaveAttribute("viewBox", "600 51.01111111111112 400 172");
    expect(container.querySelector(".world-map-selection")).toHaveTextContent("TokyoJapan");
    fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
    expect(map).toHaveAttribute("viewBox", "0 0 1000 430");
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(within(map).getAllByRole("button")).toHaveLength(communityLocations.length);
  });
  it("filters regions and supports keyboard pin selection", () => {
    const onSelect = vi.fn();
    render(<WorldMap locations={communityLocations} onSelect={onSelect} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Africa" } });
    expect(screen.queryByRole("button", { name: "Tokyo, Japan" })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("button", { name: "Nairobi, Kenya" }), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("nairobi");
  });
});

describe("requested interactions", () => {
  it("offers accessible keyboard-operated tabs without exposing hidden panels", () => {
    render(<MorphingTabs label="Member preview" tabs={[{label:"Learn",content:"Lessons"},{label:"Research",content:"Projects"},{label:"Connect",content:"People"}]} />);
    const learn = screen.getByRole("tab", { name:"Learn" });
    fireEvent.keyDown(learn, { key:"ArrowRight" });
    expect(screen.getByRole("tab", {name:"Research"})).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Projects");
    fireEvent.keyDown(screen.getByRole("tab",{name:"Research"}), {key:"End"});
    expect(screen.getByRole("tabpanel")).toHaveTextContent("People");
  });
  it("makes magnification available without hover and reports genuine loading steps", () => {
    render(<><Lens label="Inspect research"><p>Research diagram</p></Lens><MultiStepLoader steps={["Saving profile","Saving details","Ready"]} current={1} /></>);
    fireEvent.click(screen.getByRole("button", {name:/inspect research/i}));
    expect(screen.getByRole("button", {name:/return to overview/i})).toHaveAttribute("aria-pressed","true");
    expect(screen.getByRole("status")).toHaveTextContent("Saving details");
  });
});

describe("private onboarding details", () => {
  it("requires education and an age choice, not merely an OAuth display name", () => {
    expect(isOnboardingComplete({display_name:"Ryan"})).toBe(false);
    expect(validateEducation("", "16–17")).toMatch(/school/i);
    expect(validateEducation("Example School", "arbitrary")).toMatch(/age group/i);
    expect(isOnboardingComplete({onboarding_version:1,school:"Example School",age_band:"Prefer not to say"})).toBe(true);
  });
});
