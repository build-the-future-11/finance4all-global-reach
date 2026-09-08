import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

/** A search selection is fetched directly, not sought inside a truncated list. */
export function useSelectedRecord() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("selected") || undefined;
  const notice = selectedId ? (
    <div className="mb-4 flex flex-wrap items-center gap-3" role="status">
      <span>Showing the selected search result, if available to your account.</span>
      <Button variant="outline" onClick={() => {
        const next = new URLSearchParams(params);
        next.delete("selected");
        setParams(next);
      }}>Show all results</Button>
    </div>
  ) : null;
  return { selectedId, notice };
}
