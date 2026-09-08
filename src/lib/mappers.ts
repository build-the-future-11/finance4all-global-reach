import type { Tables } from "@/types/database";
import {
  ChapterSchema,
  ConnectionRequestSchema,
  EssaySubmissionSchema,
  EventSchema,
  ExplainerCardSchema,
  IntroductionPostSchema,
  LabApplicationSchema,
  NewsArticleSchema,
  NotificationSchema,
  OpportunitySchema,
  ResearchProjectSchema,
  StudioSubmissionSchema,
  UserProfileSchema,
  type Chapter,
  type ConnectionRequest,
  type EssaySubmission,
  type Event,
  type ExplainerCard,
  type IntroductionPost,
  type LabApplication,
  type NewsArticle,
  type Notification,
  type Opportunity,
  type ResearchProject,
  type StudioSubmission,
  type UserProfile,
} from "@/types/domain";
import { normalizeExternalHttpUrl } from "@/lib/external-url";
import { sanitizePostAuthPath } from "@/lib/auth-navigation";

export const PUBLIC_PROFILE_COLUMNS =
  "id, display_name, role, bio, avatar_url, interests, open_to_collaborate, chapter_id, created_at, updated_at" as const;

type PublicProfileRow = Pick<
  Tables<"profiles">,
  | "id"
  | "display_name"
  | "role"
  | "bio"
  | "avatar_url"
  | "interests"
  | "open_to_collaborate"
  | "chapter_id"
  | "created_at"
  | "updated_at"
>;

export function mapProfile(row: PublicProfileRow): UserProfile {
  return UserProfileSchema.parse({
    id: row.id,
    displayName: row.display_name,
    role: row.role,
    bio: row.bio ?? undefined,
    avatarUrl: normalizeExternalHttpUrl(row.avatar_url),
    interests: row.interests,
    openToCollaborate: row.open_to_collaborate,
    chapterId: row.chapter_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function mapNewsArticle(row: Tables<"news_articles">): NewsArticle {
  return NewsArticleSchema.parse({
    id: row.id,
    title: row.title,
    summary: row.summary,
    category: row.category,
    sourceUrl: normalizeExternalHttpUrl(row.source_url),
    publishedAt: row.published_at,
    tags: row.tags,
  });
}

export function mapExplainer(row: Tables<"explainer_cards">): ExplainerCard {
  return ExplainerCardSchema.parse({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    difficulty: row.difficulty,
    relatedTerms: row.related_terms,
  });
}

export function mapResearchProject(row: Tables<"research_projects">): ResearchProject {
  return ResearchProjectSchema.parse({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    leadResearcherId: row.lead_researcher_id,
    tags: row.tags,
    applicationDeadline: row.application_deadline ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function mapLabApplication(row: Tables<"lab_applications">): LabApplication {
  return LabApplicationSchema.parse({
    id: row.id,
    projectId: row.project_id,
    applicantId: row.applicant_id,
    status: row.status,
    motivation: row.motivation,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
  });
}

export function mapOpportunity(row: Tables<"opportunities">): Opportunity {
  return OpportunitySchema.parse({
    id: row.id,
    title: row.title,
    organization: row.organization,
    type: row.type,
    description: row.description,
    applicationUrl: normalizeExternalHttpUrl(row.application_url),
    deadline: row.deadline ?? undefined,
    tags: row.tags,
    isActive: row.is_active,
  });
}

export function mapStudioSubmission(row: Tables<"studio_submissions">): StudioSubmission {
  return StudioSubmissionSchema.parse({
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    repoUrl: normalizeExternalHttpUrl(row.repo_url),
    demoUrl: normalizeExternalHttpUrl(row.demo_url),
    writeup: row.writeup,
    submittedAt: row.submitted_at,
  });
}

export function mapEssaySubmission(
  row: Tables<"essay_submissions"> & { upvote_count?: number },
): EssaySubmission {
  return EssaySubmissionSchema.parse({
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    body: row.body,
    upvoteCount: row.upvote_count ?? 0,
    isEditorialPick: row.is_editorial_pick,
    submittedAt: row.submitted_at,
  });
}

export function mapChapter(row: Tables<"chapters">): Chapter {
  return ChapterSchema.parse({
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    memberCount: row.member_count,
  });
}

export function mapEvent(row: Tables<"events">): Event {
  const links = Array.isArray(row.program_links)
    ? row.program_links.flatMap((value) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return [];
        const label = "label" in value && typeof value.label === "string" ? value.label.trim() : "";
        const url = "url" in value ? normalizeExternalHttpUrl(value.url) : undefined;
        return label && url ? [{ label, url }] : [];
      })
    : [];
  return EventSchema.parse({
    id: row.id,
    chapterId: row.chapter_id,
    title: row.title,
    description: row.description,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? undefined,
    registrationUrl: normalizeExternalHttpUrl(row.registration_url),
    programLinks: links,
  });
}

export function mapConnectionRequest(row: Tables<"connection_requests">): ConnectionRequest {
  return ConnectionRequestSchema.parse({
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    status: row.status,
    message: row.message ?? undefined,
    createdAt: row.created_at,
  });
}

export function mapIntroductionPost(row: Tables<"introduction_posts">): IntroductionPost {
  return IntroductionPostSchema.parse({
    id: row.id,
    authorId: row.author_id,
    headline: row.headline,
    lookingFor: row.looking_for,
    interests: row.interests,
    createdAt: row.created_at,
  });
}

export function mapNotification(row: Tables<"notifications">): Notification {
  return NotificationSchema.parse({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link ? sanitizePostAuthPath(row.link, "") || undefined : undefined,
    read: row.read,
    createdAt: row.created_at,
  });
}
