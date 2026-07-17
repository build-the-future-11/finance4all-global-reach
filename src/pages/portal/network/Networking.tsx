import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
import {
  useConnectionRequests,
  useCreateIntroduction,
  useDeleteIntroduction,
  useMemberProfiles,
  MEMBER_PAGE_SIZE,
  useRespondToConnection,
  useIntroductionPosts,
  useSendConnectionRequest,
  useUpdateMyProfile,
} from "@/hooks/portal/useNetwork";
import { portalRoutes } from "@/routes/portal";
import {
  EmptyState,
  PortalCard,
  PortalDataRow,
  PortalDialogContent,
  PortalPageHeader,
  QueryStatus,
  portalButtonPrimary,
  portalButtonOutline,
  portalInputClass,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
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
import SuggestedMembersRail from "@/components/portal/SuggestedMembersRail";
import InterestPillBar from "@/components/portal/InterestPillBar";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import { portalCopy } from "@/lib/portalCopy";
import { sharedInterests } from "@/lib/personalization";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Networking() {
  useDocumentTitle("Network");
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const { data: memberData, isLoading, error, refetch } = useMemberProfiles({
    page,
    pageSize: MEMBER_PAGE_SIZE,
    search,
  });
  const members = memberData?.members;
  const totalMembers = memberData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalMembers / MEMBER_PAGE_SIZE));
  const { data: chapters } = useChapters();
  const { data: connections } = useConnectionRequests();
  const { data: introductions } = useIntroductionPosts();
  const respond = useRespondToConnection();
  const createIntro = useCreateIntroduction();
  const deleteIntro = useDeleteIntroduction();
  const sendConnect = useSendConnectionRequest();
  const updateMyProfile = useUpdateMyProfile();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectTargetId, setConnectTargetId] = useState<string | null>(null);
  const [connectMessage, setConnectMessage] = useState("");

  const [introOpen, setIntroOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [lookingFor, setLookingFor] = useState("");
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

  const connectionStatusFor = (memberId: string): "none" | "pending" | "accepted" | "declined" => {
    const conn = connections?.find(
      (c) =>
        (c.fromUserId === profile?.id && c.toUserId === memberId) ||
        (c.fromUserId === memberId && c.toUserId === profile?.id),
    );
    return conn?.status ?? "none";
  };

  const handleQuickConnect = (memberId: string) => {
    setConnectTargetId(memberId);
    setConnectMessage("");
  };

  const handleSendConnection = async () => {
    if (!connectTargetId) return;
    setConnectingId(connectTargetId);
    try {
      await sendConnect.mutateAsync({
        toUserId: connectTargetId,
        message: connectMessage.trim() || undefined,
      });
      toast.success("Connection request sent");
      setConnectTargetId(null);
      setConnectMessage("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setConnectingId(null);
    }
  };

  const handleDeleteIntro = async (id: string) => {
    try {
      await deleteIntro.mutateAsync(id);
      toast.success("Introduction removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const pendingIncoming = connections?.filter(
    (c) => c.toUserId === profile?.id && c.status === "pending",
  );

  const memberNameMap = Object.fromEntries(members?.map((m) => [m.id, m.displayName]) ?? []);
  const chapterNameMap = Object.fromEntries(chapters?.map((c) => [c.id, c.name]) ?? []);

  const filteredMembers = useMemo(() => {
    return (
      members?.filter((m) => {
        if (m.id === profile?.id) return false;
        if (collaboratorsOnly && !m.openToCollaborate) return false;
        if (chapterFilter !== "all" && m.chapterId !== chapterFilter) return false;
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return m.interests.some((i) => i.toLowerCase().includes(q));
      }) ?? []
    );
  }, [members, profile?.id, search, collaboratorsOnly, chapterFilter]);

  return (
    <div className="space-y-8">
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.network.eyebrow}
          title={portalCopy.network.title}
          description={portalCopy.network.description}
          action={
          <Dialog open={introOpen} onOpenChange={setIntroOpen}>
            <DialogTrigger asChild>
              <Button className={portalButtonPrimary}>
                <Plus className="h-4 w-4" /> Post introduction
              </Button>
            </DialogTrigger>
            <PortalDialogContent>
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
                <Button onClick={handleCreateIntro} className={portalButtonPrimary}>
                  Post
                </Button>
              </div>
            </PortalDialogContent>
          </Dialog>
        }
      />
      </PortalAnimatedSection>

      <PortalAnimatedSection delay={40}>
        <InterestPillBar />
      </PortalAnimatedSection>

      <PortalAnimatedSection delay={60}>
        <SuggestedMembersRail />
      </PortalAnimatedSection>

      <div className="mb-8">
        <CommunityPulse />
      </div>

      <PortalDataRow className="mb-8 p-5">
        <div>
          <p className="font-medium text-white">Your profile visibility</p>
          <p className="text-sm text-white/50">Let others know you're open to collaborate</p>
        </div>
        <Switch
          checked={profile?.openToCollaborate ?? false}
          onCheckedChange={handleCollaborateToggle}
        />
      </PortalDataRow>

      {pendingIncoming && pendingIncoming.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-white">Pending requests</h2>
          <div className="space-y-3">
            {pendingIncoming.map((req) => (
              <PortalDataRow key={req.id}>
                <div>
                  <p className="font-medium text-white">
                    {memberNameMap[req.fromUserId] ?? "Member"}
                  </p>
                  {req.message && <p className="text-sm text-white/50">{req.message}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className={portalButtonPrimary} onClick={() => handleRespond(req.id, "accepted")}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={portalButtonOutline}
                    onClick={() => handleRespond(req.id, "declined")}
                  >
                    Decline
                  </Button>
                </div>
              </PortalDataRow>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-white">Introductions feed</h2>
        {introductions && introductions.length === 0 && (
          <PortalCard className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-medium text-white">No introductions yet</p>
              <p className="text-sm text-white/50">Post what you're looking for — collaborators, reviewers, or project teammates.</p>
            </div>
            <Button className={portalButtonPrimary} onClick={() => setIntroOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Post introduction
            </Button>
          </PortalCard>
        )}
        <div className="space-y-3">
          {introductions?.map((post) => (
            <PortalCard key={post.id} hover className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{post.headline}</p>
                  <p className="mt-1 text-sm text-white/50">
                    by{" "}
                    <Link
                      to={`${portalRoutes.networkProfile}/${post.authorId}`}
                      className="text-emerald-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {memberNameMap[post.authorId] ?? "Member"}
                    </Link>
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
                </div>
                {post.authorId === profile?.id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-red-400/60 hover:text-red-400"
                    onClick={() => handleDeleteIntro(post.id)}
                    aria-label="Delete introduction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
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
          emptyMessage={portalCopy.network.emptyMembers}
          onRetry={() => refetch()}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <MemberDirectoryCard
                key={member.id}
                member={member}
                chapterName={member.chapterId ? chapterNameMap[member.chapterId] : undefined}
                connectionStatus={connectionStatusFor(member.id)}
                sharedInterestCount={sharedInterests(profile?.interests ?? [], member.interests).length}
                onConnect={() => handleQuickConnect(member.id)}
                connectLoading={connectingId === member.id}
              />
            ))}
          </div>
        </QueryStatus>
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-white/50">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>

      <Dialog open={Boolean(connectTargetId)} onOpenChange={(open) => !open && setConnectTargetId(null)}>
        <PortalDialogContent>
          <DialogHeader>
            <DialogTitle>Send connection request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white/70">Message (optional)</Label>
              <Textarea
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                rows={3}
                placeholder="Introduce yourself or mention shared interests…"
                className={portalInputClass}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-white/20 text-white" onClick={() => setConnectTargetId(null)}>
                Cancel
              </Button>
              <Button
                className={portalButtonPrimary}
                disabled={connectingId === connectTargetId}
                onClick={handleSendConnection}
              >
                {connectingId === connectTargetId ? "Sending…" : "Send request"}
              </Button>
            </div>
          </div>
        </PortalDialogContent>
      </Dialog>
    </div>
  );
}
