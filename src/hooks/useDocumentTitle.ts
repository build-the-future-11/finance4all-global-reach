import { useEffect } from "react";

const BASE = "Finance for All";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} — Member Space`;
    return () => {
      document.title = `${BASE} — Member Space`;
    };
  }, [title]);
}
