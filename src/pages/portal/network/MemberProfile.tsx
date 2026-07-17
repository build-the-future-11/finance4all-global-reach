import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Clock, MapPin, UserPlus, Users, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters } from "@/hooks/portal/useEvents";
import { useProfileById, useConnectionRequests, useSendConnectionRequest } from "@/hooks/portal/useNetwork";
import { portalRoutes } from "@/routes/portal";
import {
  EmptyState,
  PortalCard,
  QueryStatus,
  StatCard,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { connectionStatusLabel } from "@/lib/personalization";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import MemberBadges from "@/components/portal/MemberBadges";
import InterestPillBar from "@/components/portal/InterestPillBar";
import ProfileShareButton from "@/components/portal/ProfileShareButton";
import MemberActivityPreview from "@/components/portal/MemberActivityPreview";
import ReportContentButton from "@/components/portal/ReportContentButton";
import { computeMemberBadges } from "@/lib/badges";

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

  const isIncoming = existing?.toUserId === user?.id;
  const isOwnProfile = user?.id === id;

  const connectionCount =
    connections?.filter(
      (c) => (c.fromUserId === id || c.toUserId === id) && c.status === "accepted",
    ).length ?? 0;

  const chapter = chapters?.find((c) => c.id === profile?.chapterId);
  const memberBadges = profile ? computeMemberBadges(profile, undefined) : [];

  const handleConnect = async () => {
    if (!id) return;
    try {
      await sendRequest.mutateAsync({ toUserId: id });
      toast.success("Connection request sent — they'll be notified in the network.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send request");
    }
  };

  if (!id) return <EmptyState message={portalCopy.memberProfile.notFound} />;

  return (
    <QueryStatus
      isLoading={isLoading}
      error={error}
      isEmpty={!profile}
      emptyMessage={portalCopy.memberProfile.notFound}
      onRetry={() => refetch()}
      skeletonCount={1}
    >
      {profile && (
        <div className="space-y-6">
          <PortalAnimatedSection>
            <Link
              to={portalRoutes.network}
              className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to network
            </Link>
          </PortalAnimatedSection>

          <PortalAnimatedSection delay={40}>
            <PortalCard className="overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-emerald-500/30 via-blue-500/20 to-purple-500/25">
                <div className="portal-hero-grid absolute inset-0 opacity-40" />
              </div>
              <div className="relative px-6 pb-6">
                <Avatar className="-mt-14 h-28 w-28 border-4 border-portal-bg ring-2 ring-emerald-400/30 shadow-xl">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="bg-emerald-500/20 text-2xl text-emerald-300">
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
                    <Badge className="border-0 bg-emerald-500/15 text-emerald-300">
                      Open to collaborate
                    </Badge>
                  )}
                  {chapter && (
                    <Badge variant="outline" className="border-white/20 text-white/55">
                      <MapPin className="mr-1 h-3 w-3" />
                      {chapter.name}, {chapter.country}
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
                {profile.bio ? (
                  <p className="mt-4 max-w-2xl leading-relaxed text-white/75">{profile.bio}</p>
                ) : (
                  <p className="mt-4 text-sm italic text-white/35">{portalCopy.memberProfile.noBio}</p>
                )}

                <div className="mt-5">
                  {isOwnProfile ? (
                    <InterestPillBar />
                  ) : (
                    <InterestPillBar profileInterests={profile.interests} />
                  )}
                </div>

                {!isOwnProfile && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {existing ? (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5">
                        {existing.status === "accepted" ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : existing.status === "pending" ? (
                          <Clock className="h-4 w-4 text-amber-400" />
                        ) : (
                          <X className="h-4 w-4 text-white/40" />
                        )}
                        <span className="text-sm text-white/70">
                          {connectionStatusLabel(existing.status, isIncoming)}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-white/45">{portalCopy.memberProfile.connectPrompt}</p>
                        <Button
                          onClick={handleConnect}
                          disabled={sendRequest.isPending}
                          className={portalButtonPrimary}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          {sendRequest.isPending ? "Sending…" : "Send connection request"}
                        </Button>
                      </div>
                    )}
                    <ReportContentButton targetType="profile" targetId={id} />
                  </div>
                )}
                {isOwnProfile && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to={portalRoutes.settings}>
                      <Button variant="outline" className="border-white/20 text-white">
                        Edit your profile
                      </Button>
                    </Link>
                    <ProfileShareButton profileId={profile.id} />
                  </div>
                )}
              </div>
            </PortalCard>
          </PortalAnimatedSection>

          {memberBadges.some((b) => b.earned) && (
            <PortalAnimatedSection delay={60}>
              <PortalCard className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  {portalCopy.memberProfile.badgesTitle}
                </h3>
                <MemberBadges badges={memberBadges} compact />
              </PortalCard>
            </PortalAnimatedSection>
          )}

          <PortalAnimatedSection delay={80}>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Connections" value={connectionCount} icon={Users} accent="emerald" />
              <StatCard label="Chapter city" value={chapter?.city ?? "—"} icon={MapPin} accent="blue" />
            </div>
          </PortalAnimatedSection>

          <PortalAnimatedSection delay={100}>
            <MemberActivityPreview
              profile={profile}
              chapterName={chapter ? `${chapter.name}, ${chapter.country}` : undefined}
              connectionCount={connectionCount}
              isOwnProfile={isOwnProfile}
            />
          </PortalAnimatedSection>
        </div>
      )}
    </QueryStatus>
  );
}
