/** Placeholder for production error reporting (e.g. Sentry). Wire in ErrorBoundary. */

export interface ErrorReportContext {
  componentStack?: string;
  tags?: Record<string, string>;
}

export function reportError(error: Error, context?: ErrorReportContext) {
  if (import.meta.env.DEV) {
    console.error("[error-reporting]", error, context ?? {});
    return;
  }

  // Sentry placeholder — replace with Sentry.captureException(error, { extra: context })
  // when DSN is configured in production.
  void context;
}
