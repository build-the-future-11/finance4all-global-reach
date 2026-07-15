/**
 * Default CMS bundle — used to seed the database and as offline fallback.
 * Source of truth after seeding is Supabase; this file bootstraps initial content.
 */
export { EDUCATION_MODULES } from "@/data/educationModules";
export { LESSON_CONTENT } from "@/data/lessonContent";
export { RESOURCE_LIBRARY, UPCOMING_WEBINARS } from "@/data/resources";
export { RESOURCE_GUIDES } from "@/data/resourceGuides";

export const DEFAULT_TESTIMONIALS = [
  {
    quote:
      "The chapter page gave us one place for the budgeting module, event notes, and next steps. Students could see the lesson first, then decide whether to save a Debrief article or apply to a project.",
    attribution: "Chapter officer",
    roleLabel: "Chapter operations",
    sortOrder: 0,
  },
  {
    quote:
      "I had never taken economics. The budgeting lesson took twenty minutes; the exercise asked me to track a week of spending. By the time I attended my first Markets 101 night, I could follow the Debriefed article the officer picked — I knew what CPI meant.",
    attribution: "First-year member",
    roleLabel: "Catalyst · no prior finance background",
    sortOrder: 1,
  },
  {
    quote:
      "The project listing said exactly what the deliverable was and who would review applications. I knew what to write, what deadline mattered, and where the status would appear.",
    attribution: "Lab applicant",
    roleLabel: "Research applications",
    sortOrder: 2,
  },
] as const;
