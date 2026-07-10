import { useEffect } from "react";

const BASE = "Finance4All";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} — Global Financial Literacy`;
    return () => {
      document.title = `${BASE} — Global Financial Literacy`;
    };
  }, [title]);
}
