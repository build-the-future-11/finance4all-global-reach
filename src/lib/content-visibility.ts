// Defense in depth for mixed-version clients and explicitly selected admin rows.
// PostgreSQL RLS is authoritative; missing publication metadata fails closed.
export function isVisibleContent(_kind: string, row: { publication_state?: string }) {
  return row.publication_state === "published";
}
