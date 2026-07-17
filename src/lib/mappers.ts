import type { Database, Tables } from "@/types/database";
import type {
  Chapter,
  ChapterLeader,
  Competition,
  ConnectionRequest,
  DigestPreference,
  EssaySubmission,
  Event,
  ExplainerCard,
  IntroductionPost,
  LabApplication,
  MemberCertificate,
  NewsArticle,
  Notification,
  Opportunity,
  ResearchProject,
  StudioSubmission,
  UserProfile,
  MemberDirectoryProfile,
} from "@/types/domain";
import {
  EventSchema,
  ExplainerCardSchema,
  NewsArticleSchema,
  NotificationSchema,
  OpportunitySchema,
  UserProfileSchema,
  MemberDirectoryProfileSchema,
} from "@/types/domain";
import { z } from "zod";

function assertMapped<T>(schema: z.ZodType<T>, value: unknown, label: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    console.error(`Invalid ${label} from API:`, result.error.flatten());
    throw new Error(`Invalid ${label} data received from server.`);
  }
  return result.data;
}

export function mapProfile(row: Tables<"profiles">): UserProfile {
  return assertMapped(
    UserProfileSchema,
    {
      id: row.id,
      displayName: row.display_name,
      email: row.email,
      role: row.role,
      bio: row.bio ?? undefined,
      avatarUrl: row.avatar_url ?? undefined,
      interests: row.interests,
      openToCollaborate: row.open_to_collaborate,
      chapterId: row.chapter_id ?? undefined,
      onboardingCompletedAt: row.onboarding_completed_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    "profile",
  );
}

export function mapMemberDirectoryProfile(
  row: Database["public"]["Views"]["member_directory"]["Row"],
): MemberDirectoryProfile {
  return assertMapped(
    MemberDirectoryProfileSchema,
    {
      id: row.id,
      displayName: row.display_name,
      role: row.role,
      bio: row.bio ?? undefined,
      avatarUrl: row.avatar_url ?? undefined,
      interests: row.interests,
      openToCollaborate: row.open_to_collaborate,
      chapterId: row.chapter_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    "member directory profile",
  );
}

export function mapNewsArticle(row: Tables<"news_articles">): NewsArticle {
  return assertMapped(
    NewsArticleSchema,
    {
      id: row.id,
      title: row.title,
      summary: row.summary,
      body: row.body ?? "",
      category: row.category,
      sourceUrl: row.source_url ?? undefined,
      sourceId: row.source_id ?? undefined,
      sourcePublishedAt: row.source_published_at ?? undefined,
      topics: row.topics ?? [],
      regions: row.regions ?? [],
      importance: row.importance ?? 3,
      status: row.status ?? (row.is_published ? "published" : "draft"),
      publishedAt: row.published_at,
      isPublished: row.is_published,
      newsletterInclude: row.newsletter_include ?? false,
      aiAssisted: row.ai_assisted ?? false,
      disclaimerVersion: row.disclaimer_version ?? "edu-not-advice-v1",
      tags: row.tags,
      authorId: row.author_id ?? undefined,
      editorId: row.editor_id ?? undefined,
      scheduledFor: row.scheduled_for ?? undefined,
    },
    "news article",
  );
}

export function mapApprovedSource(row: Tables<"approved_sources">) {
  return {
    id: row.id,
    name: row.name,
    homepageUrl: row.homepage_url,
    allowedDomains: row.allowed_domains ?? [],
    notes: row.notes ?? "",
    isActive: row.is_active,
  };
}

export function mapExplainer(row: Tables<"explainer_cards">): ExplainerCard {
  return assertMapped(
    ExplainerCardSchema,
    {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      body: row.body,
      difficulty: row.difficulty,
      relatedTerms: row.related_terms,
    },
    "explainer",
  );
}

export function mapDigestPreference(row: Tables<"digest_preferences">): DigestPreference {
  return {
    userId: row.user_id,
    weeklyDigestEnabled: row.weekly_digest_enabled,
    substackSubscribed: row.substack_subscribed,
    preferredCategories: row.preferred_categories,
  };
}

export function mapResearchProject(row: Tables<"research_projects">): ResearchProject {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    leadResearcherId: row.lead_researcher_id,
    tags: row.tags,
    applicationDeadline: row.application_deadline ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLabApplication(row: Tables<"lab_applications">): LabApplication {
  return {
    id: row.id,
    projectId: row.project_id,
    applicantId: row.applicant_id,
    status: row.status,
    motivation: row.motivation,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
  };
}

export function mapOpportunity(row: Tables<"opportunities">): Opportunity {
  return assertMapped(
    OpportunitySchema,
    {
      id: row.id,
      title: row.title,
      organization: row.organization,
      type: row.type,
      description: row.description,
      applicationUrl: row.application_url ?? undefined,
      deadline: row.deadline ?? undefined,
      tags: row.tags,
      isActive: row.is_active,
    },
    "opportunity",
  );
}

export function mapStudioSubmission(row: Tables<"studio_submissions">): StudioSubmission {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    repoUrl: row.repo_url ?? undefined,
    demoUrl: row.demo_url ?? undefined,
    writeup: row.writeup,
    status: row.status ?? "pending",
    moderationNote: row.moderation_note ?? undefined,
    submittedAt: row.submitted_at,
  };
}

export function mapEssaySubmission(
  row: Tables<"essay_submissions"> & { upvote_count?: number },
): EssaySubmission {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    body: row.body,
    upvoteCount: row.upvote_count ?? 0,
    isEditorialPick: row.is_editorial_pick,
    status: row.status ?? "pending",
    moderationNote: row.moderation_note ?? undefined,
    submittedAt: row.submitted_at,
  };
}

export function mapMemberCertificate(row: Tables<"member_certificates">): MemberCertificate {
  return {
    id: row.id,
    userId: row.user_id,
    curriculumKey: row.curriculum_key,
    title: row.title,
    verificationCode: row.verification_code,
    lessonIds: row.lesson_ids ?? [],
    issuedAt: row.issued_at,
  };
}

export function mapChapterLeader(row: Tables<"chapter_leaders">): ChapterLeader {
  return {
    chapterId: row.chapter_id,
    userId: row.user_id,
    role: row.role,
    appointedAt: row.appointed_at,
  };
}

export function mapCompetition(row: Tables<"competitions">): Competition {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    chapterId: row.chapter_id ?? undefined,
    opportunityId: row.opportunity_id ?? undefined,
    startsAt: row.starts_at ?? undefined,
    endsAt: row.ends_at ?? undefined,
    registrationUrl: row.registration_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapChapter(row: Tables<"chapters">): Chapter {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    memberCount: row.member_count,
  };
}

export function mapEvent(row: Tables<"events">): Event {
  const links = Array.isArray(row.program_links)
    ? (row.program_links as { label: string; url: string }[])
    : [];
  return assertMapped(
    EventSchema,
    {
      id: row.id,
      chapterId: row.chapter_id,
      title: row.title,
      description: row.description,
      status: row.status,
      startsAt: row.starts_at,
      endsAt: row.ends_at ?? undefined,
      registrationUrl: row.registration_url ?? undefined,
      registrationOpensAt: row.registration_opens_at ?? undefined,
      registrationClosesAt: row.registration_closes_at ?? undefined,
      registrationCapacity: row.registration_capacity ?? undefined,
      programLinks: links,
    },
    "event",
  );
}

export function mapConnectionRequest(row: Tables<"connection_requests">): ConnectionRequest {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    status: row.status,
    message: row.message ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapIntroductionPost(row: Tables<"introduction_posts">): IntroductionPost {
  return {
    id: row.id,
    authorId: row.author_id,
    headline: row.headline,
    lookingFor: row.looking_for,
    interests: row.interests,
    createdAt: row.created_at,
  };
}

export function mapNotification(row: Tables<"notifications">): Notification {
  return assertMapped(
    NotificationSchema,
    {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      body: row.body,
      link: row.link ?? undefined,
      read: row.read,
      createdAt: row.created_at,
    },
    "notification",
  );
}
