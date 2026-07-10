import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, MapPin, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
import { useProfileById, useConnectionRequests, useSendConnectionRequest } from "@/hooks/portal/useNetwork";
import { portalRoutes } from "@/routes/portal";
import { EmptyState, PortalCard, QueryStatus, StatCard } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: chapters } = useChapters();
  const { data: profile, isLoading, error, refetch } = useProfileById(id);
  const { data: connections } = useConnectionRequests();
  const sendRequest = useSendConnectionRequest();

  useDocumentTitle(profile?.displayName ?? "Member");

  const existing = connections?.find(
    (c) =>
      (c.fromUserId === user?.id && c.toUserId === id) ||
      (c.fromUserId === id && c.toUserId === user?.id),
  );

  const connectionCount =
    connections?.filter(
      (c) => (c.fromUserId === id || c.toUserId === id) && c.status === "accepted",
    ).length ?? 0;

  const chapter = chapters?.find((c) => c.id === profile?.chapterId);

  const handleConnect = async () => {
    if (!id) return;
    try {
      await sendRequest.mutateAsync({ toUserId: id });
      toast.success("Connection request sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send request");
    }
  };

  if (!id) return <EmptyState message="Profile not found." />;

  return (
    <QueryStatus
      isLoading={isLoading}
      error={error}
      isEmpty={!profile}
      emptyMessage="Profile not found."
      onRetry={() => refetch()}
      skeletonCount={1}
    >
      {profile && (
        <div className="space-y-6">
          <Link
            to={portalRoutes.network}
            className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to network
          </Link>

          <PortalCard className="overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-emerald-500/25 via-blue-500/15 to-purple-500/20" />
            <div className="relative px-6 pb-6">
              <Avatar className="-mt-12 h-24 w-24 border-4 border-[#060a12] ring-2 ring-emerald-400/20">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="bg-emerald-500/20 text-xl text-emerald-300">
                  {profile.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="mt-4 text-3xl font-bold text-white">{profile.displayName}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                  {profile.role.replace("_", " ")}
                </Badge>
                {profile.openToCollaborate && (
                  <Badge className="border-0 bg-emerald-500/15 text-emerald-300">Open to collaborate</Badge>
                )}
                {chapter && (
                  <Badge variant="outline" className="border-white/20 text-white/55">
                    <MapPin className="mr-1 h-3 w-3" />
                    {chapter.name}
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-white/40">
                Member since{" "}
                {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {profile.bio && <p className="mt-4 leading-relaxed text-white/70">{profile.bio}</p>}
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
                    <Button
                      onClick={handleConnect}
                      disabled={sendRequest.isPending}
                      className="bg-emerald-500 hover:bg-emerald-400"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  )}
                </div>
              )}
            </div>
          </PortalCard>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Connections" value={connectionCount} icon={Users} accent="emerald" />
            <StatCard label="Chapter" value={chapter?.city ?? "—"} icon={MapPin} accent="blue" />
            <StatCard
              label="Interests"
              value={profile.interests.length}
              icon={Bookmark}
              accent="purple"
            />
          </div>
        </div>
      )}
    </QueryStatus>
  );
}
