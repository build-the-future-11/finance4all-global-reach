import { useState } from "react";
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
  const { data: upvotes } = useMyEssayUpvotes();
  const toggleUpvote = useToggleEssayUpvote();
  const submitEssay = useSubmitEssay();
  const authorIds = essays?.map((e) => e.authorId) ?? [];
  const { data: authors } = useProfilesByIds(authorIds);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    try {
      await submitEssay.mutateAsync({ title: title.trim(), body: body.trim() });
      toast.success("Essay published");
      setOpen(false);
      setTitle("");
      setBody("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit");
    }
  };

  const handleUpvote = async (essayId: string, upvoted: boolean) => {
    try {
      await toggleUpvote.mutateAsync({ essayId, upvoted: !upvoted });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upvote");
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
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <div>
                  <Label>Essay</Label>
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <Button onClick={handleSubmit} disabled={submitEssay.isPending}>Publish</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState message="Could not load essays." />}

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
                  <p className="mt-1 text-sm text-white/50">by {author?.displayName ?? "Member"}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{essay.body}</p>
                </div>
                <Button
                  size="sm"
                  variant={upvoted ? "default" : "outline"}
                  className={upvoted ? "" : "shrink-0 border-white/20 text-white"}
                  onClick={() => handleUpvote(essay.id, upvoted)}
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
