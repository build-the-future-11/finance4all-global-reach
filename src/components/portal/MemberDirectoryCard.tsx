import { Link } from "react-router-dom";
import type { UserProfile } from "@/types/domain";
import { portalRoutes } from "@/routes/portal";
import { PortalCard } from "@/components/portal/PortalUI";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MemberDirectoryCardProps {
  member: UserProfile;
  chapterName?: string;
  connectionStatus?: "none" | "pending" | "accepted" | "declined";
  sharedInterestCount?: number;
  onConnect?: () => void;
  connectLoading?: boolean;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MemberDirectoryCard({
  member,
  chapterName,
  connectionStatus = "none",
  sharedInterestCount = 0,
  onConnect,
  connectLoading,
}: MemberDirectoryCardProps) {
  return (
    <PortalCard hover className="group flex h-full flex-col p-4">
      <Link
        to={`${portalRoutes.networkProfile}/${member.id}`}
        className="portal-focus-ring min-w-0 flex-1 rounded-lg outline-offset-2"
      >
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
              {sharedInterestCount > 0 && (
                <Badge className="border-0 bg-indigo-500/15 text-[10px] text-indigo-300">
                  {sharedInterestCount} shared interest{sharedInterestCount !== 1 ? "s" : ""}
                </Badge>
              )}
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
      </Link>
      {onConnect && (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          {connectionStatus === "none" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
              disabled={connectLoading}
              onClick={(e) => {
                e.preventDefault();
                onConnect();
              }}
            >
              {connectLoading ? "Sending…" : "Connect"}
            </Button>
          )}
          {connectionStatus === "pending" && (
            <p className="text-center text-xs text-white/45">Request pending</p>
          )}
          {connectionStatus === "accepted" && (
            <p className="text-center text-xs text-emerald-400">Connected</p>
          )}
        </div>
      )}
    </PortalCard>
  );
}
