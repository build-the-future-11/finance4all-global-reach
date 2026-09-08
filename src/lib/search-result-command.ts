import type { SearchResult } from "@/hooks/portal/usePortalSearch";

export function searchResultCommandValue(
  item: Pick<SearchResult, "id" | "type">,
) {
  return `${item.type}:${item.id}`;
}
