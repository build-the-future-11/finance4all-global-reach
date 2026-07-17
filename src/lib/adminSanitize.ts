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
  isPublished?: boolean;
  body?: string;
  sourceId?: string;
  topics?: string[];
  regions?: string[];
  importance?: number;
  newsletterInclude?: boolean;
  aiAssisted?: boolean;
  status?: "draft" | "in_review" | "scheduled" | "published" | "corrected" | "archived";
}) {
  return {
    title: sanitizeTextInput(input.title, 200),
    summary: sanitizeTextInput(input.summary, 500),
    body: sanitizeTextInput(input.body ?? "", 20000),
    category: input.category,
    tags: sanitizeTags(input.tags.join(",")),
    sourceUrl: sanitizeOptionalUrl(input.sourceUrl),
    sourceId: input.sourceId?.trim() || undefined,
    topics: (input.topics ?? []).map((t) => sanitizeTextInput(t, 40)).filter(Boolean).slice(0, 12),
    regions: (input.regions ?? []).map((t) => sanitizeTextInput(t, 40)).filter(Boolean).slice(0, 12),
    importance: Math.min(5, Math.max(1, input.importance ?? 3)),
    newsletterInclude: input.newsletterInclude ?? false,
    aiAssisted: input.aiAssisted ?? false,
    status: input.status ?? (input.isPublished === false ? "draft" : "draft"),
    isPublished: false,
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
  endsAt?: string;
  registrationUrl?: string;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  registrationCapacity?: number;
}) {
  const startsAt = new Date(input.startsAt);
  const endsAt = input.endsAt ? new Date(input.endsAt) : undefined;
  const registrationOpensAt = input.registrationOpensAt ? new Date(input.registrationOpensAt) : undefined;
  const registrationClosesAt = input.registrationClosesAt ? new Date(input.registrationClosesAt) : undefined;

  if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
    throw new Error("Enter valid event dates.");
  }
  if (endsAt && endsAt < startsAt) throw new Error("The event end must be after its start.");
  if (registrationOpensAt && registrationClosesAt && registrationOpensAt > registrationClosesAt) {
    throw new Error("Registration cannot close before it opens.");
  }
  if (input.registrationCapacity !== undefined && (!Number.isInteger(input.registrationCapacity) || input.registrationCapacity < 1)) {
    throw new Error("Registration capacity must be a whole number greater than zero.");
  }

  return {
    chapterId: input.chapterId,
    title: sanitizeTextInput(input.title, 200),
    description: sanitizeTextInput(input.description, 1000),
    status: input.status,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt?.toISOString(),
    registrationUrl: sanitizeOptionalUrl(input.registrationUrl),
    registrationOpensAt: registrationOpensAt?.toISOString(),
    registrationClosesAt: registrationClosesAt?.toISOString(),
    registrationCapacity: input.registrationCapacity,
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
