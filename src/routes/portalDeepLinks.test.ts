import { describe, expect, it } from "vitest";
import { portalRoutes } from "@/routes/portal";

describe("portal deep links", () => {
  it("builds opportunity detail paths for search and saved", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(portalRoutes.pathwayOpportunity(id)).toBe(
      `/portal/pathways/opportunities/${id}`,
    );
  });

  it("builds lab project paths for notifications", () => {
    const id = "22222222-2222-4222-8222-222222222222";
    expect(`${portalRoutes.labs}/${id}`).toBe(`/portal/labs/${id}`);
  });
});
