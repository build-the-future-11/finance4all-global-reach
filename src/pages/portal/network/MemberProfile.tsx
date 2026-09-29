import { useResearchProjects } from "@/hooks/portal/useLabs";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, MessageCircleMore, Sparkles, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useProfileById, useConnectionRequests, useSendConnectionRequest } from "@/hooks/portal/useNetwork";
import { portalRoutes } from "@/routes/portal";
import { EmptyState, ErrorState, PortalCard, QueryStatus } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useChapters } from "@/hooks/portal/useEvents";

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: profile, isLoading, error, refetch } = useProfileById(id);
  const { data: connections } = useConnectionRequests();
  const sendRequest = useSendConnectionRequest();
  const { data: chapters } = useChapters();
  const projects = useResearchProjects();

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

  if (error) return <ErrorState message="The profile could not be loaded." onRetry={() => void refetch()} />;
  if (!profile) return <EmptyState message="Profile not found." />;

  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const chapter = chapters?.find((item) => item.id === profile.chapterId);

  return (
    <div>
      <Link
        to={portalRoutes.network}
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to network
      </Link>

      <PortalCard className="overflow-hidden">
        <div className="h-24 bg-muted" />
        <div className="relative px-6 pb-6">
          <Avatar className="-mt-10 h-20 w-20 border-4 border-[#060a12]">
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback className="bg-emerald-500/20 text-lg text-emerald-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-foreground">{profile.displayName}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/20 capitalize text-white/60">
              {profile.role.replace("_", " ")}
            </Badge>
            {profile.openToCollaborate && (
              <Badge className="border-0 bg-emerald-500/15 text-emerald-300">Open to collaborate</Badge>
            )}
          </div>
          {chapter && <p className="portal-muted mt-3 flex items-center gap-1.5 text-sm"><MapPin className="h-3.5 w-3.5" /> {chapter.name} · {chapter.city}, {chapter.country}</p>}
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <section className="rounded-2xl border border-border bg-muted/30 p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500">About</p><p className="portal-muted mt-3 leading-relaxed">{profile.bio || "This member has not published a bio yet."}</p></section>
            <section className="rounded-2xl border border-border bg-muted/30 p-5"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500"><Sparkles className="h-3.5 w-3.5" /> Interests</p>{profile.interests.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{profile.interests.map((i) => <span key={i} className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">{i}</span>)}</div> : <p className="portal-muted mt-3 text-sm">No interests have been shared.</p>}</section>
          </div>
          <section className="mt-8 border-t border-border pt-6"><h2 className="font-serif text-2xl">Led research projects</h2><QueryStatus isLoading={projects.isLoading} error={projects.error} onRetry={() => void projects.refetch()} isEmpty={!projects.data?.some(p => p.leadResearcherId === id)} emptyMessage="No public research leadership is recorded for this member.">{projects.data?.filter(p => p.leadResearcherId === id).map(p => <Link className="workspace-row" to={portalRoutes.labs + '/' + p.id} key={p.id}><h3>{p.title}</h3><span>{p.status}</span></Link>)}</QueryStatus></section>
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
          <div className="portal-muted mt-8 flex items-center gap-2 border-t border-border pt-5 text-xs"><MessageCircleMore className="h-4 w-4" /> Use a connection request to express interest in collaborating.</div>
        </div>
      </PortalCard>
    </div>
  );
}
