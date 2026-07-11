import { sanitizeUserFacingError } from "@/lib/authErrors";
import { sanitizeOptionalUrl, sanitizeTags, sanitizeTextInput } from "@/lib/security";
import type { EventStatus, NewsCategory, OpportunityType } from "@/types/domain";

export function throwSanitizedDbError(error: { message: string }): never {
  throw new Error(sanitizeUserFacingError(error.message));
}

export function sanitizeNewsInput(input: {
  title: string;
  summary: string;
  category: NewsCategory;
  tags: string[];
  sourceUrl?: string;
}) {
  return {
    title: sanitizeTextInput(input.title, 200),
    summary: sanitizeTextInput(input.summary, 500),
    category: input.category,
    tags: sanitizeTags(input.tags.join(",")),
    sourceUrl: sanitizeOptionalUrl(input.sourceUrl),
  };
}

export function sanitizeOpportunityInput(input: {
  title: string;
  organization: string;
  type: OpportunityType;
  description: string;
  applicationUrl?: string;
  tags: string[];
}) {
  return {
    title: sanitizeTextInput(input.title, 200),
    organization: sanitizeTextInput(input.organization, 120),
    type: input.type,
    description: sanitizeTextInput(input.description, 1000),
    applicationUrl: sanitizeOptionalUrl(input.applicationUrl),
    tags: sanitizeTags(input.tags.join(",")),
  };
}

export function sanitizeEventInput(input: {
  chapterId: string;
  title: string;
  description: string;
  status: EventStatus;
  startsAt: string;
  registrationUrl?: string;
}) {
  return {
    chapterId: input.chapterId,
    title: sanitizeTextInput(input.title, 200),
    description: sanitizeTextInput(input.description, 1000),
    status: input.status,
    startsAt: input.startsAt,
    registrationUrl: sanitizeOptionalUrl(input.registrationUrl),
  };
}

export function sanitizeExplainerInput(input: {
  slug: string;
  title: string;
  summary: string;
  body: string;
  difficulty: "beginner" | "intermediate";
}) {
  const slug = sanitizeTextInput(input.slug, 80).toLowerCase().replace(/\s+/g, "-");
  return {
    slug,
    title: sanitizeTextInput(input.title, 200),
    summary: sanitizeTextInput(input.summary, 500),
    body: sanitizeTextInput(input.body, 10000),
    difficulty: input.difficulty,
  };
}

export function sanitizeChapterInput(input: {
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}) {
  return {
    name: sanitizeTextInput(input.name, 120),
    city: sanitizeTextInput(input.city, 80),
    country: sanitizeTextInput(input.country, 80),
    latitude: input.latitude,
    longitude: input.longitude,
  };
}
