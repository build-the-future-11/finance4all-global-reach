import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { sanitizeUserFacingError } from "@/lib/authErrors";
import { reportError } from "@/lib/errorReporting";
import { PortalFullPageShell, portalButtonOutline, portalButtonPrimary } from "@/components/portal/PortalUI";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, { componentStack: info.componentStack ?? undefined });
  }

  render() {
    if (this.state.error) {
      return (
        <PortalFullPageShell className="text-center">
          <p className="text-6xl font-bold text-white/10" aria-hidden>
            !
          </p>
          <h1 className="mt-2 text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-white/50" role="alert">
            {sanitizeUserFacingError(this.state.error.message || "An unexpected error occurred.")}
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className={portalButtonOutline} onClick={() => window.location.reload()}>
              Reload
            </Button>
            <Button asChild className={portalButtonPrimary}>
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </PortalFullPageShell>
      );
    }
    return this.props.children;
  }
}
