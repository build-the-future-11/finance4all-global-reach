import { useAuth } from "@/contexts/AuthContext";
import {
  useProfilesByIds,
  useReviewQueue,
  useUpdateApplicationStatus,
} from "@/hooks/portal/useLabs";
import { EmptyState, LoadingState, PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LabApplicationStatus } from "@/types/domain";
import { toast } from "sonner";

export default function LabReview() {
  const { profile } = useAuth();
  const { data: queue, isLoading, error } = useReviewQueue();
  const updateStatus = useUpdateApplicationStatus();

  const applicantIds = queue?.map((a) => a.applicantId) ?? [];
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
    return <EmptyState message="Reviewer access requires lead_researcher or admin role." />;
  }

  return (
    <div>
      <PortalPageHeader
        title="Reviewer Dashboard"
        description="Review pending applications for your research projects."
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState message="Could not load review queue." />}
      {queue && queue.length === 0 && <EmptyState message="No pending applications." />}

      <div className="space-y-4">
        {queue?.map((app) => {
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
                  <p className="mt-3 text-sm text-white/70">{app.motivation}</p>
                  <p className="mt-2 text-xs text-white/40">
                    Submitted {new Date(app.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                {app.status === "pending" || app.status === "under_review" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white"
                      onClick={() => handleReview(app.id, "under_review")}
                    >
                      Mark reviewing
                    </Button>
                    <Button size="sm" onClick={() => handleReview(app.id, "accepted")}>
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
