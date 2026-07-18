import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useProfilesByIds,
  useReviewQueue,
  useUpdateApplicationStatus,
} from "@/hooks/portal/useLabs";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PortalCard,
  PortalPageHeader,
  portalButtonOutline,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LabApplicationStatus } from "@/types/domain";
import { toast } from "sonner";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function LabReview() {
  useDocumentTitle("Lab review");
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectFilter = searchParams.get("project")?.trim() || null;
  const { data: queue, isLoading, error, refetch } = useReviewQueue();
  const updateStatus = useUpdateApplicationStatus();

  const filteredQueue = useMemo(() => {
    if (!queue) return queue;
    if (!projectFilter) return queue;
    return queue.filter((app) => app.projectId === projectFilter);
  }, [queue, projectFilter]);

  const applicantIds = filteredQueue?.map((a) => a.applicantId) ?? [];
  const { data: applicants } = useProfilesByIds(applicantIds);

  const handleReview = async (applicationId: string, status: LabApplicationStatus) => {
    try {
      await updateStatus.mutateAsync({ applicationId, status });
      toast.success(`Application ${status.replace("_", " ")}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  if (profile?.role === "member") {
    return (
      <EmptyState message={portalCopy.labs.reviewAccessDenied ?? "Reviewer access requires lead_researcher or admin role."} />
    );
  }

  return (
    <div>
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.labs.reviewEyebrow}
          title={portalCopy.labs.reviewTitle ?? "Reviewer Dashboard"}
          description={portalCopy.labs.reviewDescription ?? "Review pending applications for your research projects."}
        />
      </PortalAnimatedSection>

      {isLoading && <LoadingState />}
      {error && (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load review queue."}
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !error && queue && queue.length === 0 && (
        <EmptyState message={portalCopy.labs.reviewEmpty ?? "No pending applications."} />
      )}
      {!isLoading && !error && queue && queue.length > 0 && filteredQueue && filteredQueue.length === 0 && (
        <EmptyState message="No pending applications match this project filter." />
      )}
      {projectFilter && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>Filtered to one project from your notification.</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={portalButtonOutline}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("project");
              setSearchParams(next, { replace: true });
            }}
          >
            Show all
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {filteredQueue?.map((app) => {
          const applicant = applicants?.[app.applicantId];
          return (
            <PortalCard key={app.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-white/40">{app.projectTitle}</p>
                  <h3 className="mt-1 font-semibold text-white">
                    {applicant?.displayName ?? "Unknown applicant"}
                  </h3>
                  <Badge variant="outline" className="mt-2 border-white/20 capitalize text-white/60">
                    {app.status.replace("_", " ")}
                  </Badge>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{app.motivation}</p>
                  <p className="mt-2 text-xs text-white/40">
                    Submitted {new Date(app.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                {app.status === "pending" || app.status === "under_review" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={portalButtonOutline}
                      onClick={() => handleReview(app.id, "under_review")}
                    >
                      Mark reviewing
                    </Button>
                    <Button size="sm" className={portalButtonPrimary} onClick={() => handleReview(app.id, "accepted")}>
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReview(app.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            </PortalCard>
          );
        })}
      </div>
    </div>
  );
}
