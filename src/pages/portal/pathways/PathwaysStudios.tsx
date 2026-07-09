import { useState } from "react";
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

  const handleSubmit = async () => {
    if (!title.trim() || !writeup.trim()) return;
    try {
      await submit.mutateAsync({
        title: title.trim(),
        writeup: writeup.trim(),
        repoUrl: repoUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
      });
      toast.success("Submission published");
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
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <div>
                  <Label>Writeup</Label>
                  <Textarea value={writeup} onChange={(e) => setWriteup(e.target.value)} rows={4} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <div>
                  <Label>Repo URL (optional)</Label>
                  <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <div>
                  <Label>Demo URL (optional)</Label>
                  <Input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <Button onClick={handleSubmit} disabled={submit.isPending}>Publish</Button>
              </div>
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
