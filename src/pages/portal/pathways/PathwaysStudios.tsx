import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { useStudioSubmissions, useSubmitStudio } from "@/hooks/portal/usePathways";
import { useProfilesByIds } from "@/hooks/portal/useLabs";
import {
  PortalCard,
  PortalDialogContent,
  PortalPageHeader,
  QueryStatus,
  portalButtonPrimary,
  portalInputClass,
} from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sanitizeUrl } from "@/lib/security";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import { Badge } from "@/components/ui/badge";
import { moderationLabel } from "@/lib/submissionModeration";
import { useAuth } from "@/contexts/AuthContext";
import ReportContentButton from "@/components/portal/ReportContentButton";

export default function PathwaysStudios() {
  const { user } = useAuth();
  const { data: submissions, isLoading, error, refetch } = useStudioSubmissions();
  const submit = useSubmitStudio();
  const authorIds = submissions?.map((s) => s.authorId) ?? [];
  const { data: authors } = useProfilesByIds(authorIds);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [writeup, setWriteup] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !writeup.trim()) return;
    const safeRepo = repoUrl.trim() ? sanitizeUrl(repoUrl.trim()) : null;
    const safeDemo = demoUrl.trim() ? sanitizeUrl(demoUrl.trim()) : null;
    if (repoUrl.trim() && !safeRepo) {
      toast.error("Repository URL must be a valid http(s) link.");
      return;
    }
    if (demoUrl.trim() && !safeDemo) {
      toast.error("Demo URL must be a valid http(s) link.");
      return;
    }
    try {
      await submit.mutateAsync({
        title: title.trim(),
        writeup: writeup.trim(),
        repoUrl: safeRepo ?? undefined,
        demoUrl: safeDemo ?? undefined,
      });
      toast.success("Submission received — pending admin review");
      setOpen(false);
      setTitle("");
      setWriteup("");
      setRepoUrl("");
      setDemoUrl("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit");
    }
  };

  return (
    <div>
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.pathways.studios.eyebrow}
          title={portalCopy.pathways.studios.title}
          description={portalCopy.pathways.studios.description}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className={portalButtonPrimary}>
                <Plus className="h-4 w-4" /> {portalCopy.pathwaysUi.submitProject}
              </Button>
            </DialogTrigger>
            <PortalDialogContent>
              <DialogHeader><DialogTitle>{portalCopy.pathwaysUi.submitStudios}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className={portalInputClass} />
                </div>
                <div>
                  <Label>Writeup</Label>
                  <Textarea value={writeup} onChange={(e) => setWriteup(e.target.value)} rows={4} className={portalInputClass} />
                </div>
                <div>
                  <Label>Repo URL (optional)</Label>
                  <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className={portalInputClass} />
                </div>
                <div>
                  <Label>Demo URL (optional)</Label>
                  <Input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className={portalInputClass} />
                </div>
                <Button onClick={handleSubmit} disabled={submit.isPending} className={portalButtonPrimary}>
                  {portalCopy.pathwaysUi.publish}
                </Button>
              </div>
            </PortalDialogContent>
          </Dialog>
        }
      />
      </PortalAnimatedSection>

      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={!submissions?.length}
        emptyMessage={portalCopy.pathways.studios.empty}
        onRetry={() => refetch()}
        skeletonCount={2}
      >
        <div className="space-y-4">
          {submissions?.map((sub) => {
            const author = authors?.[sub.authorId];
            return (
              <PortalCard key={sub.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {sub.status !== "approved" && sub.authorId === user?.id && (
                    <Badge variant="outline" className="border-amber-400/40 text-amber-200">
                      {moderationLabel(sub.status)}
                    </Badge>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">{sub.title}</h3>
                <p className="mt-1 text-sm text-white/50">by {author?.displayName ?? "Member"}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{sub.writeup}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {sub.repoUrl && (
                    <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:underline">
                      Repository <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {sub.demoUrl && (
                    <a href={sub.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:underline">
                      Demo <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <ReportContentButton targetType="studio" targetId={sub.id} />
                </div>
              </PortalCard>
            );
          })}
        </div>
      </QueryStatus>
    </div>
  );
}
