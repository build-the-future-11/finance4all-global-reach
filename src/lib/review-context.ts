export const REVIEW_CONTEXT_UNAVAILABLE =
  "Review context is temporarily unavailable. Please retry.";

export function requireCompleteReviewLookup<T extends { id: string }>(
  result: { data: T[] | null; error: unknown },
  expectedIds: readonly string[],
): T[] {
  if (result.error || result.data === null) {
    throw new Error(REVIEW_CONTEXT_UNAVAILABLE);
  }

  const expected = new Set(expectedIds);
  const found = new Set(result.data.map((row) => row.id));
  if ([...expected].some((id) => !found.has(id))) {
    throw new Error(REVIEW_CONTEXT_UNAVAILABLE);
  }

  return result.data;
}

export function reviewerContextState(
  queueCount: number,
  applicantsLoading: boolean,
  applicantsError: unknown,
): "idle" | "loading" | "error" | "ready" {
  if (queueCount === 0) return "idle";
  if (applicantsLoading) return "loading";
  if (applicantsError) return "error";
  return "ready";
}
