import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
import {
  useConnectionRequests,
  useCreateIntroduction,
  useMemberProfiles,
  useRespondToConnection,
  useIntroductionPosts,
  useUpdateMyProfile,
} from "@/hooks/portal/useNetwork";
import { portalRoutes } from "@/routes/portal";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  QueryStatus,
  portalInputClass,
} from "@/components/portal/PortalUI";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MemberDirectoryCard from "@/components/portal/MemberDirectoryCard";
import CommunityPulse from "@/components/portal/CommunityPulse";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Networking() {
  useDocumentTitle("Network");
  const { profile } = useAuth();
  const { data: members, isLoading, error, refetch } = useMemberProfiles();
  const { data: chapters } = useChapters();
  const { data: connections } = useConnectionRequests();
  const { data: introductions } = useIntroductionPosts();
  const respond = useRespondToConnection();
  const createIntro = useCreateIntroduction();
  const updateMyProfile = useUpdateMyProfile();

  const [introOpen, setIntroOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [search, setSearch] = useState("");
  const [collaboratorsOnly, setCollaboratorsOnly] = useState(false);
  const [chapterFilter, setChapterFilter] = useState<string>("all");

  const handleRespond = async (connectionId: string, status: "accepted" | "declined") => {
    try {
      await respond.mutateAsync({ id: connectionId, status });
      toast.success(status === "accepted" ? "Connection accepted" : "Request declined");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to respond");
    }
  };

  const handleCreateIntro = async () => {
    if (!headline.trim() || !lookingFor.trim()) return;
    try {
      await createIntro.mutateAsync({
        headline: headline.trim(),
        lookingFor: lookingFor.trim(),
        interests: profile?.interests ?? [],
      });
      toast.success("Introduction posted");
      setIntroOpen(false);
      setHeadline("");
      setLookingFor("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post");
    }
  };

  const handleCollaborateToggle = async (value: boolean) => {
    try {
      await updateMyProfile.mutateAsync({ openToCollaborate: value });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const pendingIncoming = connections?.filter(
    (c) => c.toUserId === profile?.id && c.status === "pending",
  );

  const memberNameMap = Object.fromEntries(members?.map((m) => [m.id, m.displayName]) ?? []);
  const chapterNameMap = Object.fromEntries(chapters?.map((c) => [c.id, c.name]) ?? []);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (
      members?.filter((m) => {
        if (m.id === profile?.id) return false;
        if (collaboratorsOnly && !m.openToCollaborate) return false;
        if (chapterFilter !== "all" && m.chapterId !== chapterFilter) return false;
        if (!q) return true;
        return (
          m.displayName.toLowerCase().includes(q) ||
          m.interests.some((i) => i.toLowerCase().includes(q))
        );
      }) ?? []
    );
  }, [members, profile?.id, search, collaboratorsOnly, chapterFilter]);

  return (
    <div>
      <PortalPageHeader
        eyebrow="FinanceMeta Network"
        title="Network"
        description="Discover members across global chapters, send connect requests, and post introductions."
        action={
          <Dialog open={introOpen} onOpenChange={setIntroOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-400">
                <Plus className="h-4 w-4" /> Post introduction
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/15 bg-[#0c1220] text-white">
              <DialogHeader>
                <DialogTitle>Introduction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white/70">Headline</Label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className={portalInputClass}
                  />
                </div>
                <div>
                  <Label className="text-white/70">What are you looking for?</Label>
                  <Textarea
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    rows={3}
                    className={portalInputClass}
                  />
                </div>
                <Button onClick={handleCreateIntro} className="bg-emerald-500 hover:bg-emerald-400">
                  Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-8">
        <CommunityPulse />
      </div>

      <PortalCard className="mb-8 flex items-center justify-between p-5">
        <div>
          <p className="font-medium text-white">Your profile visibility</p>
          <p className="text-sm text-white/50">Let others know you're open to collaborate</p>
        </div>
        <Switch
          checked={profile?.openToCollaborate ?? false}
          onCheckedChange={handleCollaborateToggle}
        />
      </PortalCard>

      {pendingIncoming && pendingIncoming.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-white">Pending requests</h2>
          <div className="space-y-3">
            {pendingIncoming.map((req) => (
              <PortalCard key={req.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-white">
                    {memberNameMap[req.fromUserId] ?? "Member"}
                  </p>
                  {req.message && <p className="text-sm text-white/50">{req.message}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRespond(req.id, "accepted")}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white"
                    onClick={() => handleRespond(req.id, "declined")}
                  >
                    Decline
                  </Button>
                </div>
              </PortalCard>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-white">Introductions feed</h2>
        {introductions && introductions.length === 0 && (
          <EmptyState message="No introductions yet. Be the first to post!" />
        )}
        <div className="space-y-3">
          {introductions?.map((post) => (
            <PortalCard key={post.id} hover className="p-4">
              <p className="font-medium text-white">{post.headline}</p>
              <p className="mt-1 text-sm text-white/50">
                by {memberNameMap[post.authorId] ?? "Member"}
              </p>
              <p className="mt-2 text-sm text-white/70">{post.lookingFor}</p>
              {post.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.interests.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-white/15 text-[10px] text-white/50"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </PortalCard>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">Members</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or interest…"
              className={`max-w-xs ${portalInputClass}`}
            />
            <label className="flex items-center gap-2 text-sm text-white/55">
              <Switch checked={collaboratorsOnly} onCheckedChange={setCollaboratorsOnly} />
              Open to collaborate
            </label>
            {chapters && chapters.length > 0 && (
              <Select value={chapterFilter} onValueChange={setChapterFilter}>
                <SelectTrigger className={`w-40 ${portalInputClass}`}>
                  <SelectValue placeholder="Chapter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All chapters</SelectItem>
                  {chapters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <QueryStatus
          isLoading={isLoading}
          error={error}
          isEmpty={filteredMembers.length === 0}
          emptyMessage="No members match your filters."
          onRetry={() => refetch()}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <MemberDirectoryCard
                key={member.id}
                member={member}
                chapterName={member.chapterId ? chapterNameMap[member.chapterId] : undefined}
              />
            ))}
          </div>
        </QueryStatus>
      </section>
    </div>
  );
}
