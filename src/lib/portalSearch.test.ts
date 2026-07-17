import { afterEach, describe, expect, it, vi } from "vitest";
import { openPortalSearch, PORTAL_SEARCH_OPEN_EVENT } from "@/lib/portalSearch";

describe("openPortalSearch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dispatches the portal search open event on window", () => {
    const spy = vi.spyOn(window, "dispatchEvent");
    openPortalSearch();
    expect(spy).toHaveBeenCalledTimes(1);
    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe(PORTAL_SEARCH_OPEN_EVENT);
  });
});
