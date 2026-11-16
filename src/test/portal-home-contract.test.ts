import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { portalNav, portalRoutes } from "@/routes/portal";

describe("member portal home contract", () => {
  it("routes the portal index to the dedicated member dashboard", () => {
    const router = readFileSync("src/components/AppRouter.tsx", "utf8");

    expect(router).toContain('import("@/pages/portal/Dashboard")');
    expect(router).not.toContain('const Dashboard = lazy(() => import("@/pages/portal/ResearchWorkspace"))');
  });

  it("keeps core discovery destinations directly visible in navigation", () => {
    const directPaths = new Set(portalNav.map((item) => item.path));

    expect(directPaths).toContain(portalRoutes.debriefed);
    expect(directPaths).toContain(portalRoutes.network);
    expect(directPaths).toContain(portalRoutes.learning);
    expect(directPaths).toContain(portalRoutes.myResearch);
    expect(portalNav.find((item) => item.path === portalRoutes.network)?.group).toBe("Explore");
  });

  it("does not present unloaded dashboard data as a confirmed zero", () => {
    const dashboard = readFileSync("src/pages/portal/Dashboard.tsx", "utf8");

    expect(dashboard).toContain('return value === undefined ? "—" : value.length');
    expect(dashboard).toContain("Account scoped");
    expect(dashboard).toContain("No confirmed deadline");
  });
});
