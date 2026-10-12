import { useRef, useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { useStudioSubmissions, useSubmitStudio } from "@/hooks/portal/usePathways";
import { useProfilesByIds } from "@/hooks/portal/useLabs";
import { EmptyState, LoadingState, PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function PathwaysStudios() {
  const { data: submissions, isLoading, error } = useStudioSubmissions();
  const submit = useSubmitStudio();
  const authorIds = submissions?.map((s) => s.authorId) ?? [];
  const { data: authors } = useProfilesByIds(authorIds);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [writeup, setWriteup] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const draftRevision = useRef(0);
  const submissionLock = useRef(false);
  const [submissionPending, setSubmissionPending] = useState(false);
  const [savedEarlierVersion, setSavedEarlierVersion] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current || submit.isPending || !title.trim() || !writeup.trim()) return;
    submissionLock.current = true;
    setSubmissionPending(true);
    setSavedEarlierVersion(false);
    const submittedRevision = draftRevision.current;
    try {
      await submit.mutateAsync({
        title: title.trim(),
        writeup: writeup.trim(),
        repoUrl: repoUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
      });
      // A confirmed older submission must not clear edits made while it saved.
      if (draftRevision.current === submittedRevision) {
        toast.success("Submission saved for review");
        setOpen(false);
        setTitle("");
        setWriteup("");
        setRepoUrl("");
        setDemoUrl("");
      } else {
        setSavedEarlierVersion(true);
        toast.success("Submission saved for review. Your form is still open.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      submissionLock.current = false;
      setSubmissionPending(false);
    }
  };

  return (
    <div>
      <PortalPageHeader
        title="Finance Studios"
        description="Showcase project repos, demos, and writeups."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Submit project</Button>
            </DialogTrigger>
            <DialogContent className="border-white/15 bg-[#0c1220] text-white">
              <DialogHeader><DialogTitle>Submit to Studios</DialogTitle></DialogHeader>
              <form className="space-y-4" aria-busy={submissionPending || submit.isPending} onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="studio-title">Title</Label>
                  <Input id="studio-title" name="title" required value={title} onChange={(e) => { draftRevision.current += 1; setTitle(e.target.value); }} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <div>
                  <Label htmlFor="studio-writeup">Writeup</Label>
                  <Textarea id="studio-writeup" name="writeup" required value={writeup} onChange={(e) => { draftRevision.current += 1; setWriteup(e.target.value); }} rows={4} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <div>
                  <Label htmlFor="studio-repo-url">Repo URL (optional)</Label>
                  <Input id="studio-repo-url" name="repoUrl" type="url" value={repoUrl} onChange={(e) => { draftRevision.current += 1; setRepoUrl(e.target.value); }} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <div>
                  <Label htmlFor="studio-demo-url">Demo URL (optional)</Label>
                  <Input id="studio-demo-url" name="demoUrl" type="url" value={demoUrl} onChange={(e) => { draftRevision.current += 1; setDemoUrl(e.target.value); }} className="mt-1 border-white/20 bg-white/5" />
                </div>
                {savedEarlierVersion && <p role="status" className="text-sm">The version you submitted was saved for review. Your form is still open. Review the fields before submitting again.</p>}
                <Button type="submit" disabled={submissionPending || submit.isPending}>{submissionPending || submit.isPending ? "Saving for review…" : "Submit for review"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState message="Could not load submissions." />}

      <div className="space-y-4">
        {submissions?.map((sub) => {
          const author = authors?.[sub.authorId];
          return (
            <PortalCard key={sub.id} className="p-5">
              <h3 className="text-lg font-semibold text-white">{sub.title}</h3>
              {(sub.publicationState ?? "draft") !== "published" && <p className="text-sm">{sub.publicationState === "archived" ? "Archived" : "Awaiting publication review"} · Visible to you and administrators.</p>}
              <p className="mt-1 text-sm text-white/50">by {author?.displayName ?? "Member"}</p>
              <p className="mt-3 text-sm text-white/70">{sub.writeup}</p>
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
              </div>
            </PortalCard>
          );
        })}
      </div>
    </div>
  );
}
