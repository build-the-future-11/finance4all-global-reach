import { Link, useParams } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileById, useConnectionRequests, useSendConnectionRequest } from "@/hooks/portal/useNetwork";
import { portalRoutes } from "@/routes/portal";
import { EmptyState, PortalCard } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfileById(id);
  const { data: connections } = useConnectionRequests();
  const sendRequest = useSendConnectionRequest();

  if (!id) return <EmptyState message="Profile not found." />;

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

  if (isLoading) {
    return (
      <PortalCard className="animate-pulse p-8">
        <div className="mx-auto h-20 w-20 rounded-full bg-white/10" />
      </PortalCard>
    );
  }

  if (!profile) return <EmptyState message="Profile not found." />;

  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <Link
        to={portalRoutes.network}
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to network
      </Link>

      <PortalCard className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-purple-500/20" />
        <div className="relative px-6 pb-6">
          <Avatar className="-mt-10 h-20 w-20 border-4 border-[#060a12]">
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback className="bg-emerald-500/20 text-lg text-emerald-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-bold text-white">{profile.displayName}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/20 capitalize text-white/60">
              {profile.role.replace("_", " ")}
            </Badge>
            {profile.openToCollaborate && (
              <Badge className="border-0 bg-emerald-500/15 text-emerald-300">Open to collaborate</Badge>
            )}
          </div>
          {profile.bio && <p className="mt-4 text-white/70 leading-relaxed">{profile.bio}</p>}
          {profile.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/55">
                  {i}
                </span>
              ))}
            </div>
          )}
          {user?.id !== id && (
            <div className="mt-6">
              {existing ? (
                <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                  Connection: {existing.status}
                </Badge>
              ) : (
                <Button onClick={handleConnect} disabled={sendRequest.isPending} className="bg-emerald-500 hover:bg-emerald-400">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              )}
            </div>
          )}
        </div>
      </PortalCard>
    </div>
  );
}
