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
      "Our chapter ran the Catalyst budgeting module in three Mumbai schools last semester. Two students from that cohort applied to Atlas Lab six months later — one on FX pass-through, one on rural credit access. The portal kept the curriculum and the lab listings in one place.",
    attribution: "Chapter officer",
    roleLabel: "Mumbai · outreach & Meta Labs",
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
      "The lab listing said exactly what the deliverable was and who would review applications. I wrote three paragraphs on a macro methods course and a Python project. The lead replied in five days with a data collection task — not a generic 'we'll be in touch.'",
    attribution: "Lab applicant",
    roleLabel: "Meta Labs · macro track",
    sortOrder: 2,
  },
] as const;
