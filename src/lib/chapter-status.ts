import type { ChapterStatus } from "@/content/community";
import { normalizeExternalHttpUrl } from "@/lib/external-url";

export interface ChapterEvidence {
  chapter_status?: string;
  accepted_owner?: boolean;
  permissions_confirmed?: boolean;
  operating_evidence_url?: string | null;
  last_activity_at?: string | null;
}
export function verifiedChapterStatus(row: ChapterEvidence, now = Date.now()): ChapterStatus {
  const status = row.chapter_status;
  if (!status || !["unverified", "expansion_interest", "application_received", "lead_screening", "pre_launch", "approved", "active_verified", "inactive"].includes(status)) return "unverified";
  if (status !== "active_verified") return status as ChapterStatus;
  const activity = Date.parse(row.last_activity_at ?? "");
  return row.accepted_owner && row.permissions_confirmed && normalizeExternalHttpUrl(row.operating_evidence_url) && Number.isFinite(activity) && activity <= now && now - activity <= 45 * 86_400_000 ? "active_verified" : "unverified";
}
