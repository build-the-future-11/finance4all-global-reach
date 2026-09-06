export const MAX_DEADLINE_TIMEOUT_MS = 2_147_483_647;

export class DeadlineExceededError extends Error {
  readonly timeoutMs: number;

  constructor(operation: string, timeoutMs: number) {
    super(`${operation} timed out after ${timeoutMs}ms`);
    this.name = "DeadlineExceededError";
    this.timeoutMs = timeoutMs;
  }
}

export async function withDeadline<T>(
  operation: () => PromiseLike<T>,
  timeoutMs: number,
  operationName: string,
): Promise<T> {
  if (
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs <= 0 ||
    timeoutMs > MAX_DEADLINE_TIMEOUT_MS
  ) {
    throw new RangeError(
      `timeoutMs must be a positive safe integer no greater than ${MAX_DEADLINE_TIMEOUT_MS}`,
    );
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new DeadlineExceededError(operationName, timeoutMs)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([Promise.resolve().then(operation), timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}
