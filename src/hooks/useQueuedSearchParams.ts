import { useCallback, useLayoutEffect, useRef } from "react";
import { createSearchParams, useSearchParams, type SetURLSearchParams } from "react-router-dom";

/** Compose rapid filter edits before React Router commits its next navigation. */
export function useQueuedSearchParams(): [URLSearchParams, SetURLSearchParams] {
  const [params, setParams] = useSearchParams();
  const pending = useRef(params);

  // Back/forward and links remain authoritative once their location commits.
  useLayoutEffect(() => { pending.current = params; }, [params]);

  const setQueuedParams = useCallback<SetURLSearchParams>((nextInit, options) => {
    // React Router's callback setter is not a React state-update queue. Keep
    // the latest requested query synchronously so an adjacent control cannot
    // overwrite an edit whose navigation has not rendered yet.
    const next = createSearchParams(typeof nextInit === "function"
      ? nextInit(new URLSearchParams(pending.current))
      : nextInit);
    setParams(next, options);
    pending.current = next;
  }, [setParams]);

  return [params, setQueuedParams];
}
