import { Link } from "react-router-dom";
import type { UserProfile } from "@/types/domain";
import { portalRoutes } from "@/routes/portal";
import { PortalCard } from "@/components/portal/PortalUI";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface MemberDirectoryCardProps {
  member: UserProfile;
  chapterName?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MemberDirectoryCard({ member, chapterName }: MemberDirectoryCardProps) {
  return (
    <Link to={`${portalRoutes.networkProfile}/${member.id}`}>
      <PortalCard hover className="group h-full p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 border border-white/15">
            <AvatarImage src={member.avatarUrl} />
            <AvatarFallback className="bg-emerald-500/15 text-sm text-emerald-300">
              {initials(member.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white group-hover:text-emerald-200">
              {member.displayName}
            </p>
            {chapterName && (
              <p className="mt-0.5 truncate text-xs text-white/40">{chapterName}</p>
            )}
            {member.bio && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/50">
                {member.bio}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {member.openToCollaborate && (
                <Badge className="border-0 bg-emerald-400/15 text-[10px] text-emerald-300">
                  Open to collaborate
                </Badge>
              )}
              {member.interests.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/45 ring-1 ring-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PortalCard>
    </Link>
  );
}
