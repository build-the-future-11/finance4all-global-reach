export class DeadlineExceededError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`${label} exceeded ${timeoutMs}ms deadline`);
    this.name = "DeadlineExceededError";
  }
}

export async function withDeadline<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  label = "Operation",
): Promise<T> {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
    throw new TypeError("timeoutMs must be a positive integer");
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
