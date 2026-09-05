export class DeadlineExceededError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`${label} exceeded ${timeoutMs}ms deadline`);
    this.name = "DeadlineExceededError";
  }
}

export const MAX_DEADLINE_TIMEOUT_MS = 2_147_483_647;

export async function withDeadline<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  label = "Operation",
): Promise<T> {
  if (
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > MAX_DEADLINE_TIMEOUT_MS
  ) {
    throw new TypeError(
      `timeoutMs must be a positive safe integer no greater than ${MAX_DEADLINE_TIMEOUT_MS}`,
    );
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new DeadlineExceededError(label, timeoutMs)), timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve().then(operation), timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
