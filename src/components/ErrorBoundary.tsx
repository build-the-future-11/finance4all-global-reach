import { Component, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#060a12] px-4 text-center text-white">
          <p className="text-6xl font-bold text-white/10">!</p>
          <h1 className="mt-2 text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-white/50">
            {this.state.error.message || "An unexpected error occurred."}
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="border-white/20 text-white"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-400">
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
