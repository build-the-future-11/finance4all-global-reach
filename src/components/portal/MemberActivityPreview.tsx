import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Handshake } from "lucide-react";
import type { UserProfile } from "@/types/domain";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import { PortalCard } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { useEducationProgress } from "@/hooks/portal/useEducationProgress";

interface MemberActivityPreviewProps {
  profile: UserProfile;
  chapterName?: string;
  connectionCount: number;
  isOwnProfile?: boolean;
}

export default function MemberActivityPreview({
  profile,
  chapterName,
  connectionCount,
  isOwnProfile = false,
}: MemberActivityPreviewProps) {
  const { totalLessons } = useEducationProgress();
  const allLessonIds = EDUCATION_MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const completedLessons = totalLessons(allLessonIds);

  return (
    <PortalCard className="p-5">
      <h3 className="text-sm font-semibold text-white">{portalCopy.memberActivity.title}</h3>
      <div className="mt-3 space-y-2.5 text-sm text-white/60">
        {profile.openToCollaborate && (
          <p className="flex items-center gap-2">
            <Handshake className="h-4 w-4 shrink-0 text-emerald-400" />
            {portalCopy.memberActivity.openToCollaborate}
          </p>
        )}
        {chapterName && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
            {portalCopy.memberActivity.chapterMember}: {chapterName}
          </p>
        )}
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-amber-400" />
          {connectionCount} {portalCopy.memberActivity.connections}
        </p>
        {profile.createdAt && (
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-purple-400" />
            {portalCopy.memberActivity.memberSince}{" "}
            {new Date(profile.createdAt).toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        {isOwnProfile && completedLessons > 0 && (
          <p className="text-xs text-white/45">
            {portalCopy.memberActivity.readingProgress}: {completedLessons}/{allLessonIds.length}
          </p>
        )}
      </div>
      {profile.interests.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {profile.interests.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="border-white/15 text-[10px] text-white/50">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <Link
        to={portalRoutes.network}
        className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
      >
        {portalCopy.memberActivity.viewNetwork} →
      </Link>
    </PortalCard>
  );
}
