export function requireConfirmedRow<T>(
  result: { data: T | null; error: unknown },
  action: string,
): T {
  if (result.error) throw result.error;
  if (!result.data) {
    throw new Error(`${action} was not confirmed. Refresh and try again.`);
  }
  return result.data;
}
