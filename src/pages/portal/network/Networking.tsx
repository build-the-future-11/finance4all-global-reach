import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useConnectionRequests,
  useCreateIntroduction,
  useMemberProfiles,
  useProfileById,
  useRespondToConnection,
  useSendConnectionRequest,
  useIntroductionPosts,
} from "@/hooks/portal/useNetwork";
import { portalRoutes } from "@/routes/portal";
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
import { Switch } from "@/components/ui/switch";
import { useUpdateMyProfile } from "@/hooks/portal/useNetwork";
import { toast } from "sonner";

function MemberProfile({ id }: { id: string }) {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfileById(id);
  const { data: connections } = useConnectionRequests();
  const sendRequest = useSendConnectionRequest();

  const existing = connections?.find(
    (c) =>
      (c.fromUserId === user?.id && c.toUserId === id) ||
      (c.fromUserId === id && c.toUserId === user?.id),
  );

  const handleConnect = async () => {
    try {
      await sendRequest.mutateAsync({ toUserId: id });
      toast.success("Connection request sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send request");
    }
  };

  if (isLoading) return <LoadingState />;
  if (!profile) return <EmptyState message="Profile not found." />;

  return (
    <div>
      <Link to={portalRoutes.network} className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to network
      </Link>
      <PortalCard className="p-6">
        <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
        <Badge variant="outline" className="mt-2 border-white/20 capitalize text-white/60">
          {profile.role.replace("_", " ")}
        </Badge>
        {profile.openToCollaborate && (
          <Badge className="ml-2 bg-emerald-400/15 text-emerald-300">Open to collaborate</Badge>
        )}
        {profile.bio && <p className="mt-4 text-white/70">{profile.bio}</p>}
        {profile.interests.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.interests.map((i) => (
              <span key={i} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">{i}</span>
            ))}
          </div>
        )}
        {user?.id !== id && (
          <div className="mt-6">
            {existing ? (
              <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                {existing.status}
              </Badge>
            ) : (
              <Button onClick={handleConnect} disabled={sendRequest.isPending}>
                <UserPlus className="h-4 w-4" /> Connect
              </Button>
            )}
          </div>
        )}
      </PortalCard>
    </div>
  );
}

export default function Networking() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { data: members, isLoading } = useMemberProfiles();
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

  if (id) return <MemberProfile id={id} />;

  const pendingIncoming = connections?.filter(
    (c) => c.toUserId === profile?.id && c.status === "pending",
  );

  const memberNameMap = Object.fromEntries(members?.map((m) => [m.id, m.displayName]) ?? []);

  return (
    <div>
      <PortalPageHeader
        title="Network"
        description="Discover members, send connect requests, and post introductions. No DMs in v1."
        action={
          <Dialog open={introOpen} onOpenChange={setIntroOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Post introduction</Button>
            </DialogTrigger>
            <DialogContent className="border-white/15 bg-[#0c1220] text-white">
              <DialogHeader><DialogTitle>Introduction</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Headline</Label>
                  <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <div>
                  <Label>What are you looking for?</Label>
                  <Textarea value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} rows={3} className="mt-1 border-white/20 bg-white/5" />
                </div>
                <Button onClick={handleCreateIntro}>Post</Button>
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
                  <p className="font-medium text-white">{memberNameMap[req.fromUserId] ?? "Member"}</p>
                  {req.message && <p className="text-sm text-white/50">{req.message}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRespond(req.id, "accepted")}>Accept</Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white" onClick={() => handleRespond(req.id, "declined")}>Decline</Button>
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
              <p className="mt-1 text-sm text-white/50">by {memberNameMap[post.authorId] ?? "Member"}</p>
              <p className="mt-2 text-sm text-white/70">{post.lookingFor}</p>
            </PortalCard>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Members</h2>
        {isLoading && <LoadingState />}
        <div className="grid gap-3 sm:grid-cols-2">
          {members
            ?.filter((m) => m.id !== profile?.id)
            .map((member) => (
              <Link key={member.id} to={`${portalRoutes.network}/profile/${member.id}`}>
                <PortalCard className="p-4 transition hover:border-white/30 hover:bg-white/[0.07]">
                  <p className="font-medium text-white">{member.displayName}</p>
                  {member.openToCollaborate && (
                    <Badge className="mt-2 bg-emerald-400/15 text-xs text-emerald-300">Open to collaborate</Badge>
                  )}
                  {member.interests.length > 0 && (
                    <p className="mt-2 text-xs text-white/40">{member.interests.join(" · ")}</p>
                  )}
                </PortalCard>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
