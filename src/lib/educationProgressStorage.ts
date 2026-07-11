export const EDUCATION_PROGRESS_STORAGE_KEY = "f4a-education-progress";

export function isMissingTableError(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || Boolean(error?.message?.includes("does not exist"));
}

export function readLocalEducationProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(EDUCATION_PROGRESS_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function writeLocalEducationProgress(completed: Set<string>) {
  localStorage.setItem(EDUCATION_PROGRESS_STORAGE_KEY, JSON.stringify([...completed]));
}

export function toggleLocalEducationProgress(lessonId: string): Set<string> {
  const next = readLocalEducationProgress();
  if (next.has(lessonId)) next.delete(lessonId);
  else next.add(lessonId);
  writeLocalEducationProgress(next);
  return next;
}
