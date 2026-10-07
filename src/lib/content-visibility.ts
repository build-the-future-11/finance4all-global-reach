// Compatibility quarantine for historical demo seeds. This is a presentation
// boundary, not authorization or evidence of editorial approval. Replace it with
// database publication state once that migration can be reviewed and certified.
const retiredTitles: Record<string, ReadonlySet<string>> = {
  news: new Set([
    "Fed signals patience on rate cuts amid sticky inflation",
    "Tech IPO pipeline heats up for Q3",
    "S&P 500 hits new high as megacap earnings beat",
    "NVIDIA supplier raises guidance on data center demand",
  ]),
  opportunity: new Set([
    "Summer Markets Analyst Internship",
    "Finance4All Case Competition",
    "YC-style Fintech Fellowship",
    "Research Assistant — EM Credit",
  ]),
  event: new Set(["IIT Finance Case Night", "London Markets 101 Workshop"]),
};
const retiredExplainers = new Set(["what-is-an-ipo", "rate-cuts-explained", "sector-rotation"]);

export function isVisibleContent(kind: "news" | "opportunity" | "event" | "explainer" | "chapter", row: { id?: string; title?: string; slug?: string }) {
  if (kind === "chapter") return !row.id?.startsWith("70000000-0000-4000-8000-00000000000");
  if (kind === "explainer") return !retiredExplainers.has(row.slug ?? "");
  return !retiredTitles[kind]?.has(row.title ?? "");
}
