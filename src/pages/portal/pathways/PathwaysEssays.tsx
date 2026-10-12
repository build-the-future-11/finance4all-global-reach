import { useRef, useState } from "react";
import { Plus, ThumbsUp } from "lucide-react";
import {
  useEssays,
  useMyEssayUpvotes,
  useSubmitEssay,
  useToggleEssayUpvote,
} from "@/hooks/portal/usePathways";
import { useProfilesByIds } from "@/hooks/portal/useLabs";
import { EmptyState, LoadingState, PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
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

export default function PathwaysEssays() {
  const { data: essays, isLoading, error } = useEssays();
  const {
    data: upvotes,
    isSuccess: upvotesReady,
    isFetching: upvotesFetching,
    error: upvotesError,
    refetch: refetchUpvotes,
  } = useMyEssayUpvotes();
  const toggleUpvote = useToggleEssayUpvote();
  const upvoteLock = useRef(false);
  const [upvotePending, setUpvotePending] = useState(false);
  const canChangeUpvote = upvotesReady && !upvotesFetching && !upvotesError && upvotes !== undefined;
  const submitEssay = useSubmitEssay();
  const authorIds = essays?.map((e) => e.authorId) ?? [];
  const { data: authors } = useProfilesByIds(authorIds);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const draftRevision = useRef(0);
  const submissionLock = useRef(false);
  const [submissionPending, setSubmissionPending] = useState(false);
  const [savedEarlierVersion, setSavedEarlierVersion] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current || submitEssay.isPending || !title.trim() || !body.trim()) return;
    submissionLock.current = true;
    setSubmissionPending(true);
    setSavedEarlierVersion(false);
    const submittedRevision = draftRevision.current;
    try {
      await submitEssay.mutateAsync({ title: title.trim(), body: body.trim() });
      // A confirmed older submission must not clear edits made while it saved.
      if (draftRevision.current === submittedRevision) {
        toast.success("Essay saved for review");
        setOpen(false);
        setTitle("");
        setBody("");
      } else {
        setSavedEarlierVersion(true);
        toast.success("Essay saved for review. Your form is still open.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      submissionLock.current = false;
      setSubmissionPending(false);
    }
  };

  const handleUpvote = async (essayId: string, upvoted: boolean, published: boolean) => {
    if (!canChangeUpvote || upvoteLock.current || toggleUpvote.isPending || (!upvoted && !published)) return;
    upvoteLock.current = true;
    setUpvotePending(true);
    try {
      await toggleUpvote.mutateAsync({ essayId, upvoted: !upvoted });
      // Wait for the confirmed state before another toggle can choose its action.
      await refetchUpvotes({ cancelRefetch: false });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upvote");
    } finally {
      upvoteLock.current = false;
      setUpvotePending(false);
    }
  };

  return (
    <div>
      <PortalPageHeader
        title="Financial Takes Challenge"
        description="Essay submissions with community upvotes and editorial picks."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Submit essay</Button>
            </DialogTrigger>
            <DialogContent className="border-white/15 bg-[#0c1220] text-white">
              <DialogHeader><DialogTitle>Submit your take</DialogTitle></DialogHeader>
              <form className="space-y-4" aria-busy={submissionPending || submitEssay.isPending} onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="essay-title">Title</Label>
                  <Input id="essay-title" name="title" required value={title} onChange={(e) => { draftRevision.current += 1; setTitle(e.target.value); }} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <div>
                  <Label htmlFor="essay-body">Essay</Label>
                  <Textarea id="essay-body" name="body" required value={body} onChange={(e) => { draftRevision.current += 1; setBody(e.target.value); }} rows={8} className="mt-1 border-white/20 bg-white/5" />
                </div>
                {savedEarlierVersion && <p role="status" className="text-sm">The version you submitted was saved for review. Your form is still open. Review the fields before submitting again.</p>}
                <Button type="submit" disabled={submissionPending || submitEssay.isPending}>{submissionPending || submitEssay.isPending ? "Saving for review…" : "Submit for review"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState message="Could not load essays." />}
      {upvotesError && (
        <div role="alert" className="mb-4 space-y-2">
          <p>Your upvote status is unavailable. Retry before changing an upvote.</p>
          <Button variant="outline" disabled={upvotesFetching} onClick={() => void refetchUpvotes()}>
            Retry upvote status
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {essays?.map((essay) => {
          const upvoted = upvotes?.has(essay.id) ?? false;
          const author = authors?.[essay.authorId];
          return (
            <PortalCard key={essay.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {essay.isEditorialPick && (
                      <Badge className="bg-amber-400/15 text-amber-300">Editorial pick</Badge>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{essay.title}</h3>
              {(essay.publicationState ?? "draft") !== "published" && <p className="text-sm">{essay.publicationState === "archived" ? "Archived" : "Awaiting publication review"} · Visible to you and administrators.</p>}
                  <p className="mt-1 text-sm text-white/50">by {author?.displayName ?? "Member"}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{essay.body}</p>
                </div>
                <Button
                  size="sm"
                  variant={upvoted ? "default" : "outline"}
                  className={upvoted ? "" : "shrink-0 border-white/20 text-white"}
                  disabled={!canChangeUpvote || upvotePending || toggleUpvote.isPending || (!upvoted && essay.publicationState !== "published")}
                  aria-label={upvotesError ? `Vote unavailable for ${essay.title}` : !canChangeUpvote ? `Checking your vote for ${essay.title}` : upvotePending || toggleUpvote.isPending ? `Updating your vote for ${essay.title}` : upvoted ? `Remove your upvote for ${essay.title}` : `Upvote ${essay.title}`}
                  aria-pressed={canChangeUpvote ? upvoted : undefined}
                  onClick={() => handleUpvote(essay.id, upvoted, essay.publicationState === "published")}
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${upvoted ? "fill-current" : ""}`} />
                  {essay.upvoteCount}
                </Button>
              </div>
            </PortalCard>
          );
        })}
      </div>
    </div>
  );
}
