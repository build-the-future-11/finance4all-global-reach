import { useEffect } from "react";
import { portalCopy } from "@/lib/portalCopy";

const BASE = "Finance4All";
const DEFAULT_SUFFIX = portalCopy.landing.documentTitle;

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} — ${DEFAULT_SUFFIX}`;
    return () => {
      document.title = `${BASE} — ${DEFAULT_SUFFIX}`;
    };
  }, [title]);
}
