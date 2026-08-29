import type { MemberStats } from "@/hooks/portal/useMemberStats";
import type { MemberDirectoryProfile, UserProfile } from "@/types/domain";

export interface MemberBadge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

export function computeMemberBadges(
  profile: UserProfile | MemberDirectoryProfile | null,
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
      description: "FinanceMeta account created",
      earned: Boolean(profile.displayName),
    },
    {
      id: "connector",
      label: "Connected",
      description: "At least one accepted connection",
      earned: s.connections >= 1,
    },
    {
      id: "networker",
      label: "Well connected",
      description: "Five or more accepted connections",
      earned: s.connections >= 5,
    },
    {
      id: "reader",
      label: "Active reader",
      description: "Saved three or more Debriefed articles",
      earned: s.savedArticles >= 3,
    },
    {
      id: "researcher",
      label: "Lab bookmark",
      description: "Saved a Meta Labs project",
      earned: s.savedProjects >= 1,
    },
    {
      id: "applicant",
      label: "Lab applicant",
      description: "Submitted a Meta Labs application",
      earned: s.labApplications >= 1,
    },
    {
      id: "chapter",
      label: "Chapter linked",
      description: "Chapter set in Settings",
      earned: Boolean(profile.chapterId),
    },
    {
      id: "collaborator",
      label: "Open to collaborate",
      description: "Visible to members looking for collaborators",
      earned: profile.openToCollaborate,
    },
    {
      id: "lead",
      label: "Lead researcher",
      description: "Reviews applications for lab projects",
      earned: profile.role === "lead_researcher" || profile.role === "admin",
    },
    {
      id: "event",
      label: "Event RSVP",
      description: "Registered for a chapter event",
      earned: s.eventsRegistered >= 1,
    },
  ];
}
