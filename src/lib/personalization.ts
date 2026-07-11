/** Personalization helpers for portal UX */

export function timeGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function interestMatchScore(
  itemTags: string[],
  userInterests: string[],
): number {
  if (!userInterests.length || !itemTags.length) return 0;
  const normalized = new Set(userInterests.map((i) => i.toLowerCase()));
  return itemTags.filter((t) => normalized.has(t.toLowerCase())).length;
}

export function sharedInterests(a: string[], b: string[]): string[] {
  const setB = new Set(b.map((i) => i.toLowerCase()));
  return a.filter((i) => setB.has(i.toLowerCase()));
}

export function connectionStatusLabel(status: string, isIncoming: boolean): string {
  switch (status) {
    case "pending":
      return isIncoming ? "Respond to request" : "Request sent";
    case "accepted":
      return "Connected";
    case "declined":
      return "Declined";
    default:
      return status.replace("_", " ");
  }
}

export const INTEREST_TO_CATEGORY: Record<string, string> = {
  macro: "macro",
  equities: "markets",
  fintech: "company",
  credit: "macro",
  startups: "company",
  research: "markets",
};

export function interestsToNewsCategories(interests: string[]): string[] {
  const cats = new Set<string>();
  for (const i of interests) {
    const cat = INTEREST_TO_CATEGORY[i.toLowerCase()];
    if (cat) cats.add(cat);
  }
  return [...cats];
}
