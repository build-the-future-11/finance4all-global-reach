import { z } from "zod";
import { normalizeExternalHttpUrl } from "@/lib/external-url";

const sourceSchema = z.object({
  title: z.string().min(1).max(300),
  url: z.string().refine(value => Boolean(normalizeExternalHttpUrl(value)), "A safe source URL is required"),
  modifiedAt: z.string().datetime(),
  content: z.string().max(60000),
}).strict();

const draftSchema = z.object({
  format: z.literal("finance-debriefed-draft-v1"),
  state: z.literal("editorial-draft"),
  source: sourceSchema,
  claimPack: sourceSchema,
  article: z.object({
    slug: z.string().min(3).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(5).max(300),
    summary: z.string().min(20).max(1500),
    body: z.string().min(100).max(45000),
    difficulty: z.enum(["beginner", "intermediate"]),
    related_terms: z.array(z.string().min(1).max(100)).max(20),
  }).strict(),
  requiredReviews: z.array(z.string().min(1).max(300)).min(1).max(20),
}).strict();

export type EditorialDraftImport = z.infer<typeof draftSchema>;
export function parseEditorialDraft(text: string): EditorialDraftImport {
  if (new TextEncoder().encode(text).byteLength > 150000) throw new Error("Draft package exceeds 150 KB.");
  const draft = draftSchema.parse(JSON.parse(text));
  if (new TextEncoder().encode(JSON.stringify(draft.article)).byteLength > 60000) throw new Error("Draft article exceeds the member-content size budget.");
  return draft;
}
