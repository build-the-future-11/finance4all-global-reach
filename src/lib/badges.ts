import type { MemberStats } from "@/hooks/portal/useMemberStats";
import type { UserProfile } from "@/types/domain";

export interface MemberBadge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

export function computeMemberBadges(
  profile: UserProfile | null,
  stats: MemberStats | undefined,
): MemberBadge[] {
  if (!profile) return [];

  const s = stats ?? {
    connections: 0,
    savedArticles: 0,
    savedProjects: 0,
    labApplications: 0,
    eventsRegistered: 0,
  };

  return [
    {
      id: "founding",
      label: "Member",
      description: "Joined the Finance4All global network",
      earned: Boolean(profile.displayName),
    },
    {
      id: "connector",
      label: "Connector",
      description: "Made 1+ accepted connections",
      earned: s.connections >= 1,
    },
    {
      id: "networker",
      label: "Networker",
      description: "5+ connections",
      earned: s.connections >= 5,
    },
    {
      id: "reader",
      label: "Curious Reader",
      description: "Saved 3+ news articles",
      earned: s.savedArticles >= 3,
    },
    {
      id: "researcher",
      label: "Lab Explorer",
      description: "Bookmarked a research project",
      earned: s.savedProjects >= 1,
    },
    {
      id: "applicant",
      label: "Lab Applicant",
      description: "Applied to a Meta Labs project",
      earned: s.labApplications >= 1,
    },
    {
      id: "chapter",
      label: "Chapter Member",
      description: "Joined a global chapter",
      earned: Boolean(profile.chapterId),
    },
    {
      id: "collaborator",
      label: "Open to Collaborate",
      description: "Visible for collaboration",
      earned: profile.openToCollaborate,
    },
    {
      id: "lead",
      label: "Lead Researcher",
      description: "Verified research lead",
      earned: profile.role === "lead_researcher" || profile.role === "admin",
    },
    {
      id: "event",
      label: "Event Goer",
      description: "Registered for a chapter event",
      earned: s.eventsRegistered >= 1,
    },
  ];
}
