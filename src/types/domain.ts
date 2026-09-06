import { z } from "zod";
import { normalizeExternalHttpUrl } from "@/lib/external-url";

const ExternalHttpUrlSchema = z.string().url().refine(
  (value) => Boolean(normalizeExternalHttpUrl(value)),
  "Must be an http or https URL without embedded credentials",
);

// ─── Auth & Users ───────────────────────────────────────────────────────────

export const UserRoleSchema = z.enum(["member", "lead_researcher", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1),
  role: UserRoleSchema,
  bio: z.string().optional(),
  avatarUrl: ExternalHttpUrlSchema.optional(),
  interests: z.array(z.string()).default([]),
  openToCollaborate: z.boolean().default(false),
  chapterId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

// ─── Finance Debriefed Hub ────────────────────────────────────────────────────

export const NewsCategorySchema = z.enum(["macro", "markets", "ipo", "company"]);
export type NewsCategory = z.infer<typeof NewsCategorySchema>;

export const NewsArticleSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  summary: z.string(),
  category: NewsCategorySchema,
  sourceUrl: ExternalHttpUrlSchema.optional(),
  publishedAt: z.string().datetime(),
  tags: z.array(z.string()).default([]),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const ExplainerCardSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  body: z.string(),
  difficulty: z.enum(["beginner", "intermediate"]).default("beginner"),
  relatedTerms: z.array(z.string()).default([]),
});
export type ExplainerCard = z.infer<typeof ExplainerCardSchema>;

export const DigestPreferenceSchema = z.object({
  userId: z.string().uuid(),
  weeklyDigestEnabled: z.boolean().default(false),
  substackSubscribed: z.boolean().default(false),
  preferredCategories: z.array(NewsCategorySchema).default([]),
});
export type DigestPreference = z.infer<typeof DigestPreferenceSchema>;

// ─── Finance Meta Labs ────────────────────────────────────────────────────────

export const ResearchProjectStatusSchema = z.enum([
  "draft",
  "open",
  "reviewing",
  "closed",
]);
export type ResearchProjectStatus = z.infer<typeof ResearchProjectStatusSchema>;

export const ResearchProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: ResearchProjectStatusSchema,
  leadResearcherId: z.string().uuid(),
  tags: z.array(z.string()).default([]),
  applicationDeadline: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ResearchProject = z.infer<typeof ResearchProjectSchema>;

export const LabApplicationStatusSchema = z.enum([
  "pending",
  "under_review",
  "accepted",
  "rejected",
]);
export type LabApplicationStatus = z.infer<typeof LabApplicationStatusSchema>;

export const LabApplicationSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  applicantId: z.string().uuid(),
  status: LabApplicationStatusSchema,
  motivation: z.string(),
  submittedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().optional(),
  reviewerId: z.string().uuid().optional(),
});
export type LabApplication = z.infer<typeof LabApplicationSchema>;

// ─── Axiom Pathways + Studios ─────────────────────────────────────────────────

export const OpportunityTypeSchema = z.enum([
  "internship",
  "program",
  "challenge",
  "project_role",
]);
export type OpportunityType = z.infer<typeof OpportunityTypeSchema>;

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  organization: z.string(),
  type: OpportunityTypeSchema,
  description: z.string(),
  applicationUrl: ExternalHttpUrlSchema.optional(),
  deadline: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

export const StudioSubmissionSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  title: z.string(),
  repoUrl: ExternalHttpUrlSchema.optional(),
  demoUrl: ExternalHttpUrlSchema.optional(),
  writeup: z.string(),
  submittedAt: z.string().datetime(),
});
export type StudioSubmission = z.infer<typeof StudioSubmissionSchema>;

export const EssaySubmissionSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  upvoteCount: z.number().int().nonnegative().default(0),
  isEditorialPick: z.boolean().default(false),
  submittedAt: z.string().datetime(),
});
export type EssaySubmission = z.infer<typeof EssaySubmissionSchema>;

// ─── Events + Chapters ────────────────────────────────────────────────────────

export const EventStatusSchema = z.enum(["upcoming", "live", "completed"]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const ChapterSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  memberCount: z.number().int().nonnegative().default(0),
});
export type Chapter = z.infer<typeof ChapterSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  chapterId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: EventStatusSchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  registrationUrl: ExternalHttpUrlSchema.optional(),
  programLinks: z
    .array(z.object({ label: z.string(), url: ExternalHttpUrlSchema }))
    .default([]),
});
export type Event = z.infer<typeof EventSchema>;

// ─── Networking ───────────────────────────────────────────────────────────────

export const ConnectionStatusSchema = z.enum(["pending", "accepted", "declined"]);
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;

export const ConnectionRequestSchema = z.object({
  id: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  status: ConnectionStatusSchema,
  message: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type ConnectionRequest = z.infer<typeof ConnectionRequestSchema>;

export const IntroductionPostSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  headline: z.string(),
  lookingFor: z.string(),
  interests: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
});
export type IntroductionPost = z.infer<typeof IntroductionPostSchema>;

// ─── Bookmarks & Notifications ──────────────────────────────────────────────

export const NotificationTypeSchema = z.enum([
  "connection_request",
  "connection_accepted",
  "lab_application_status",
  "lab_application_received",
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string(),
  body: z.string(),
  link: z.string().optional(),
  read: z.boolean().default(false),
  createdAt: z.string().datetime(),
});
export type Notification = z.infer<typeof NotificationSchema>;
