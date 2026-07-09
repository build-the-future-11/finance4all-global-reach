import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

export default function Networking() {
  const { profile } = useAuth();
  const { data: members, isLoading, error, refetch } = useMemberProfiles();
  const { data: connections } = useConnectionRequests();
  const { data: introductions } = useIntroductionPosts();
  const respond = useRespondToConnection();
  const createIntro = useCreateIntroduction();
  const updateMyProfile = useUpdateMyProfile();

  const [introOpen, setIntroOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [lookingFor, setLookingFor] = useState("");

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
  const otherMembers = members?.filter((m) => m.id !== profile?.id) ?? [];

  return (
    <div>
      <PortalPageHeader
        title="Network"
        description="Discover members, send connect requests, and post introductions. No DMs in v1."
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
        <h2 className="mb-3 text-lg font-semibold text-white">Members</h2>
        <QueryStatus
          isLoading={isLoading}
          error={error}
          isEmpty={otherMembers.length === 0}
          emptyMessage="No other members yet. Invite your chapter!"
          onRetry={() => refetch()}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {otherMembers.map((member) => (
              <Link key={member.id} to={`${portalRoutes.networkProfile}/${member.id}`}>
                <PortalCard className="p-4 transition hover:border-white/30 hover:bg-white/[0.07]">
                  <p className="font-medium text-white">{member.displayName}</p>
                  {member.openToCollaborate && (
                    <Badge className="mt-2 bg-emerald-400/15 text-xs text-emerald-300">
                      Open to collaborate
                    </Badge>
                  )}
                  {member.interests.length > 0 && (
                    <p className="mt-2 text-xs text-white/40">{member.interests.join(" · ")}</p>
                  )}
                </PortalCard>
              </Link>
            ))}
          </div>
        </QueryStatus>
      </section>
    </div>
  );
}
