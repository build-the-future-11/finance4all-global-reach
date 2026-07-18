/** Display labels derived from opportunity/event tags without new DB enums. */

export function programKindLabels(input: {
  title?: string;
  type?: string;
  tags?: string[];
  description?: string;
}): string[] {
  const hay = `${input.title ?? ""} ${input.type ?? ""} ${(input.tags ?? []).join(" ")} ${input.description ?? ""}`.toLowerCase();
  const labels: string[] = [];
  if (/\bfellowship\b/.test(hay)) labels.push("Fellowship");
  if (/\bworkshop\b/.test(hay)) labels.push("Workshop");
  if (/\bcompetition\b|\bolympiad\b/.test(hay)) labels.push("Competition");
  if (/\binternship\b/.test(hay) || input.type === "internship") labels.push("Internship");
  return [...new Set(labels)];
}

export function isSampleContent(title: string): boolean {
  return /^\[sample\]/i.test(title.trim());
}

export function stripSamplePrefix(title: string): string {
  return title.replace(/^\[sample\]\s*/i, "").trim();
}

/** Hide development seed rows from members in production builds. */
export function isPublicListingTitle(title: string): boolean {
  if (!import.meta.env.PROD) return true;
  return !isSampleContent(title);
}
