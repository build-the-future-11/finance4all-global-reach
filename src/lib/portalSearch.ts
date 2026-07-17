export const PORTAL_SEARCH_OPEN_EVENT = "f4a:open-portal-search";

export function openPortalSearch() {
  window.dispatchEvent(new CustomEvent(PORTAL_SEARCH_OPEN_EVENT));
}
