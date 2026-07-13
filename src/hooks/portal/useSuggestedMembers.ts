import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMemberProfiles, useConnectionRequests } from "@/hooks/portal/useNetwork";
import { interestMatchScore } from "@/lib/personalization";
import type { MemberDirectoryProfile } from "@/types/domain";

export function useSuggestedMembers(limit = 6) {
  const { profile, user } = useAuth();
  const membersQuery = useMemberProfiles();
  const connectionsQuery = useConnectionRequests();

  const members = useMemo((): MemberDirectoryProfile[] => {
    if (!profile || !membersQuery.data) return [];

    const connectedOrPending = new Set<string>();
    connectionsQuery.data?.forEach((c) => {
      if (c.fromUserId === user?.id) connectedOrPending.add(c.toUserId);
      if (c.toUserId === user?.id) connectedOrPending.add(c.fromUserId);
    });

    const scored = membersQuery.data.members
      .filter((m) => m.id !== profile.id && !connectedOrPending.has(m.id))
      .map((m) => ({
        member: m,
        score:
          interestMatchScore(m.interests, profile.interests) +
          (m.chapterId && m.chapterId === profile.chapterId ? 2 : 0) +
          (m.openToCollaborate ? 1 : 0),
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.member);
  }, [profile, membersQuery.data, connectionsQuery.data, user?.id, limit]);

  return {
    members,
    isLoading: membersQuery.isLoading || connectionsQuery.isLoading,
    error: membersQuery.error ?? connectionsQuery.error,
  };
}
