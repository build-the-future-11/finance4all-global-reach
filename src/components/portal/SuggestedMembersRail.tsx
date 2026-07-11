import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useSuggestedMembers } from "@/hooks/portal/useSuggestedMembers";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import MemberDirectoryCard from "@/components/portal/MemberDirectoryCard";
import { useChapters } from "@/hooks/portal/useEvents";
import { PortalCard, SkeletonList } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";

export default function SuggestedMembersRail() {
  const { members: suggested, isLoading, error } = useSuggestedMembers(3);
  const { data: chapters } = useChapters();
  const chapterMap = Object.fromEntries(chapters?.map((c) => [c.id, c.name]) ?? []);

  if (isLoading) {
    return <SkeletonList count={3} />;
  }

  if (error) {
    return (
      <PortalCard className="p-5">
        <p className="text-sm text-white/50">{portalCopy.personalized.suggestedLoadError}</p>
      </PortalCard>
    );
  }

  if (!suggested.length) {
    return (
      <PortalCard className="p-5">
        <p className="text-sm text-white/50">{portalCopy.personalized.suggestedEmpty}</p>
        <Button asChild variant="outline" size="sm" className="mt-3 border-white/20 text-white">
          <Link to={portalRoutes.settings}>Update interests</Link>
        </Button>
      </PortalCard>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">Suggested connections</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {suggested.map((m) => (
          <MemberDirectoryCard
            key={m.id}
            member={m}
            chapterName={m.chapterId ? chapterMap[m.chapterId] : undefined}
          />
        ))}
      </div>
    </section>
  );
}
