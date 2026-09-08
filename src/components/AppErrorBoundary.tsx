import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  failed: boolean;
}

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: unknown, info: ErrorInfo) {
    console.error("[FinanceMeta] Unhandled application render failure", info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060a12] px-6 text-white">
        <section
          role="alert"
          aria-live="assertive"
          className="w-full max-w-lg border border-white/15 bg-white/[0.04] p-8 text-center"
        >
          <p className="text-xs font-semibold uppercase text-emerald-300">FinanceMeta</p>
          <h1 className="mt-3 text-2xl font-semibold">This page could not load</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Your account was not changed. Reload the page once, or return to the public homepage.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={() => window.location.reload()}>
              <RotateCcw aria-hidden="true" />
              Reload page
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-transparent text-white">
              <a href="/">Return home</a>
            </Button>
          </div>
        </section>
      </main>
    );
  }
}
