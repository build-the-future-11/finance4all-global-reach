export const AGE_BANDS = ["Under 13", "13–15", "16–17", "18–20", "21–24", "25+", "Prefer not to say"] as const;
export const ONBOARDING_VERSION = 1;

export function isOnboardingComplete(metadata: Record<string, unknown> | undefined) {
  return metadata?.onboarding_version === ONBOARDING_VERSION
    && typeof metadata?.school === "string" && metadata.school.trim().length > 0
    && AGE_BANDS.includes(metadata?.age_band as typeof AGE_BANDS[number]);
}

export function validateEducation(school: string, ageBand: string) {
  if (!school.trim()) return "Enter your school, university, or current learning community.";
  if (school.trim().length > 160) return "Please keep your school name under 160 characters.";
  if (!AGE_BANDS.includes(ageBand as typeof AGE_BANDS[number])) return "Choose your age group, or select Prefer not to say.";
  return null;
}
