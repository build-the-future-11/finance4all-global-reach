import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Plus, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
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
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChapters } from "@/hooks/portal/useEvents";

export default function Networking() {
  useDocumentTitle("Network");
  const { profile } = useAuth();
  const { data: members, isLoading, error, refetch } = useMemberProfiles();
  const { data: connections } = useConnectionRequests();
  const { data: introductions } = useIntroductionPosts();
  const { data: chapters } = useChapters();
  const respond = useRespondToConnection();
  const createIntro = useCreateIntroduction();
  const updateMyProfile = useUpdateMyProfile();

  const [introOpen, setIntroOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [search, setSearch] = useState("");
  const [collaboratorsOnly, setCollaboratorsOnly] = useState(false);

  const handleRespond = async (connectionId: string, status: "accepted" | "declined") => {
    try {
      await respond.mutateAsync({ id: connectionId, status });
      toast.success(status === "accepted" ? "Connection accepted" : "Request declined");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to respond");
    }
  };

  const handleCreateIntro = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
  const chapterNameMap = Object.fromEntries(chapters?.map((chapter) => [chapter.id, chapter.name]) ?? []);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (
      members?.filter((m) => {
        if (m.id === profile?.id) return false;
        if (collaboratorsOnly && !m.openToCollaborate) return false;
        if (!q) return true;
        return (
          m.displayName.toLowerCase().includes(q) ||
          m.interests.some((i) => i.toLowerCase().includes(q))
        );
      }) ?? []
    );
  }, [members, profile?.id, search, collaboratorsOnly]);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Member directory"
        title="People behind the work"
        description="Find members by interests, read what they are working on, and request a connection. Profiles only show information members have chosen to publish. Direct messages are coming soon."
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
              <form className="space-y-4" onSubmit={handleCreateIntro}>
                <div>
                  <Label htmlFor="introduction-headline" className="text-white/70">Headline</Label>
                  <Input
                    id="introduction-headline"
                    name="headline"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className={portalInputClass}
                  />
                </div>
                <div>
                  <Label htmlFor="introduction-looking-for" className="text-white/70">What are you looking for?</Label>
                  <Textarea
                    id="introduction-looking-for"
                    name="lookingFor"
                    required
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    rows={3}
                    className={portalInputClass}
                  />
                </div>
                <Button type="submit" disabled={createIntro.isPending} className="bg-emerald-500 hover:bg-emerald-400">
                  Post
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <PortalCard className="mb-8 flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center">
        <div>
          <Label htmlFor="network-profile-visibility" className="font-medium text-foreground">Make your profile useful</Label>
          <p id="network-profile-visibility-description" className="portal-muted mt-1 text-sm">Add a bio and interests in Settings, then choose whether you are open to collaboration.</p>
        </div>
        <div className="flex items-center gap-4"><Link to={portalRoutes.settings} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-500">Edit profile <ArrowUpRight className="h-3.5 w-3.5" /></Link><Switch
          id="network-profile-visibility"
          aria-describedby="network-profile-visibility-description"
          checked={profile?.openToCollaborate ?? false}
          onCheckedChange={handleCollaborateToggle}
        /></div>
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
            <PortalCard key={post.id} className="p-4">
              <p className="font-medium text-white">{post.headline}</p>
              <p className="mt-1 text-sm text-white/50">
                by {memberNameMap[post.authorId] ?? "Member"}
              </p>
              <p className="mt-2 text-sm text-white/70">{post.lookingFor}</p>
            </PortalCard>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">Members</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              aria-label="Search members"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or interest…"
              className={`max-w-xs ${portalInputClass}`}
            />
            <label htmlFor="network-collaborators-only" className="flex items-center gap-2 text-sm text-white/55">
              <Switch id="network-collaborators-only" checked={collaboratorsOnly} onCheckedChange={setCollaboratorsOnly} />
              Open to collaborate
            </label>
          </div>
        </div>
        <QueryStatus
          isLoading={isLoading}
          error={error}
          isEmpty={filteredMembers.length === 0}
          emptyMessage="No members match your filters."
          onRetry={() => refetch()}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredMembers.map((member) => {
              const initials = member.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
              return <Link key={member.id} to={`${portalRoutes.networkProfile}/${member.id}`}>
                <PortalCard hover className="group flex h-full min-h-64 flex-col p-5">
                  <div className="flex items-start justify-between gap-4"><Avatar className="h-12 w-12 border border-border"><AvatarImage src={member.avatarUrl} /><AvatarFallback className="bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-300">{initials || <UserRound className="h-5 w-5" />}</AvatarFallback></Avatar><ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
                  <p className="mt-5 font-serif text-xl font-semibold text-foreground">{member.displayName}</p>
                  <p className="portal-muted mt-1 text-xs capitalize">{member.role.replace("_", " ")}</p>
                  {member.openToCollaborate && (
                    <Badge className="mt-2 bg-emerald-400/15 text-xs text-emerald-300">
                      Open to collaborate
                    </Badge>
                  )}
                  <p className="portal-muted mt-3 line-clamp-3 text-sm leading-relaxed">{member.bio || "Bio coming soon — this member has not published an introduction yet."}</p>
                  {member.interests.length > 0 && (
                    <p className="portal-muted mt-3 line-clamp-2 text-xs">{member.interests.join(" · ")}</p>
                  )}
                  {member.chapterId && chapterNameMap[member.chapterId] && <p className="portal-muted mt-auto flex items-center gap-1 pt-5 text-xs"><MapPin className="h-3 w-3" /> {chapterNameMap[member.chapterId]}</p>}
                </PortalCard>
              </Link>
            })}
          </div>
        </QueryStatus>
      </section>
    </div>
  );
}
