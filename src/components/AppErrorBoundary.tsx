import { Component, type ReactNode } from "react";

export default class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto max-w-lg p-8" role="alert">
        <h1 className="text-xl font-semibold">This page could not load</h1>
        <p className="my-4">Check your connection and reload the page. Unsaved form changes may need to be entered again.</p>
        <button type="button" className="rounded border px-4 py-2 focus-visible:outline focus-visible:outline-2" onClick={() => window.location.reload()}>Reload page</button>
      </main>
    );
  }
}
