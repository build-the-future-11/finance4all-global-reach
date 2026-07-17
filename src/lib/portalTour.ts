export const PORTAL_TOUR_STORAGE_KEY = "f4a-portal-tour-v1";

export function replayPortalTour() {
  localStorage.removeItem(PORTAL_TOUR_STORAGE_KEY);
  window.location.reload();
}
