import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNewsArticles, useExplainers } from "@/hooks/portal/useDebriefed";
import { useResearchProjects } from "@/hooks/portal/useLabs";
import { useOpportunities } from "@/hooks/portal/usePathways";
import { useMemberProfiles } from "@/hooks/portal/useNetwork";
import { useEvents } from "@/hooks/portal/useEvents";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { interestMatchScore, interestsToNewsCategories } from "@/lib/personalization";
import { portalRoutes } from "@/routes/portal";
import type { LucideIcon } from "lucide-react";
import { FlaskConical, Newspaper, Briefcase, Users, Calendar, BookOpen } from "lucide-react";

export interface PersonalizedItem {
  id: string;
  title: string;
  description: string;
  href: string;
  reason: string;
  icon: LucideIcon;
  accent: "emerald" | "blue" | "amber" | "purple";
}

export function usePersonalizedRecommendations(limit = 6) {
  const { profile } = useAuth();
  const interests = useMemo(() => profile?.interests ?? [], [profile?.interests]);
  const newsQuery = useNewsArticles();
  const projectsQuery = useResearchProjects("all");
  const oppsQuery = useOpportunities();
  const membersQuery = useMemberProfiles();
  const allEventsQuery = useEvents();
  const chapterEventsQuery = useEvents(profile?.chapterId);
  const explainersQuery = useExplainers();

  const news = newsQuery.data;
  const projects = projectsQuery.data;
  const opps = oppsQuery.data;
  const members = membersQuery.data?.members;
  const allEvents = allEventsQuery.data;
  const chapterEvents = chapterEventsQuery.data;
  const explainers = explainersQuery.data;

  const eventsForRecs = useMemo(() => {
    if (profile?.chapterId && chapterEvents?.some((e) => e.status === "upcoming")) {
      return chapterEvents;
    }
    return allEvents;
  }, [profile?.chapterId, chapterEvents, allEvents]);

  const items = useMemo((): PersonalizedItem[] => {
    if (!interests.length) return [];

    const scored: (PersonalizedItem & { score: number })[] = [];
    const preferredCats = new Set(interestsToNewsCategories(interests));

    news?.forEach((a) => {
      const tagScore = interestMatchScore(a.tags, interests);
      const catScore = preferredCats.has(a.category) ? 2 : 0;
      const score = tagScore + catScore;
      if (score > 0) {
        scored.push({
          id: `news-${a.id}`,
          title: a.title,
          description: a.summary.slice(0, 120),
          href: `${portalRoutes.debriefed}?article=${a.id}`,
          reason: tagScore > 0 ? `Matches your interest in ${a.tags[0]}` : `Related to ${a.category}`,
          icon: Newspaper,
          accent: "emerald",
          score,
        });
      }
    });

    projects
      ?.filter((p) => p.status === "open")
      .forEach((p) => {
        const score = interestMatchScore(p.tags, interests);
        if (score > 0) {
          scored.push({
            id: `lab-${p.id}`,
            title: p.title,
            description: p.description.slice(0, 120),
            href: `${portalRoutes.labs}/${p.id}`,
            reason: `Open lab · matches ${p.tags.find((t) => interests.includes(t)) ?? "your interests"}`,
            icon: FlaskConical,
            accent: "blue",
            score,
          });
        }
      });

    opps?.forEach((o) => {
      const score = interestMatchScore(o.tags, interests);
      if (score > 0) {
        scored.push({
          id: `opp-${o.id}`,
          title: o.title,
          description: `${o.organization} · ${o.type.replace("_", " ")}`,
          href: portalRoutes.pathwaysOpportunities,
          reason: `Matches your interest in ${interests.find((i) => o.tags?.some((t) => t.toLowerCase().includes(i.toLowerCase()))) ?? "your focus"}`,
          icon: Briefcase,
          accent: "amber",
          score,
        });
      }
    });

    members
      ?.filter((m) => m.id !== profile?.id && m.openToCollaborate)
      .forEach((m) => {
        const score = interestMatchScore(m.interests, interests);
        if (score > 0) {
          scored.push({
            id: `member-${m.id}`,
            title: m.displayName,
            description: m.bio?.slice(0, 100) ?? "Open to collaborate",
            href: `${portalRoutes.networkProfile}/${m.id}`,
            reason: `${score} shared interest${score > 1 ? "s" : ""}`,
            icon: Users,
            accent: "purple",
            score,
          });
        }
      });

    eventsForRecs
      ?.filter((e) => e.status === "upcoming")
      .forEach((e) => {
        let score = 0;
        if (profile?.chapterId && e.chapterId === profile.chapterId) score += 3;
        const descScore = interests.filter((i) =>
          e.description.toLowerCase().includes(i.toLowerCase()),
        ).length;
        score += descScore;
        if (score > 0) {
          scored.push({
            id: `event-${e.id}`,
            title: e.title,
            description: e.description.slice(0, 120),
            href: portalRoutes.events,
            reason:
              e.chapterId === profile?.chapterId ? "Upcoming at your chapter" : "Upcoming chapter event",
            icon: Calendar,
            accent: "purple",
            score,
          });
        }
      });

    explainers?.forEach((ex) => {
      const score = interestMatchScore(ex.relatedTerms, interests);
      if (score > 0) {
        scored.push({
          id: `explainer-${ex.id}`,
          title: ex.title,
          description: ex.summary.slice(0, 120),
          href: `${portalRoutes.debriefedExplainers}/${ex.slug}`,
          reason: `Explainer · ${ex.relatedTerms[0] ?? "your interests"}`,
          icon: BookOpen,
          accent: "emerald",
          score,
        });
      }
    });

    for (const mod of EDUCATION_MODULES) {
      for (const lesson of mod.lessons) {
        const textTags = [
          ...lesson.objectives,
          lesson.summary,
          mod.title,
          ...interests.filter((i) => lesson.title.toLowerCase().includes(i.toLowerCase())),
        ];
        const score = interestMatchScore(textTags, interests);
        if (score > 0) {
          scored.push({
            id: `lesson-${lesson.id}`,
            title: lesson.title,
            description: `${mod.title} · ${lesson.durationMin} min`,
            href: `${portalRoutes.education}/${lesson.id}`,
            reason: `Catalyst lesson · ${interests.find((i) => lesson.title.toLowerCase().includes(i.toLowerCase())) ?? mod.title}`,
            icon: BookOpen,
            accent: "blue",
            score: score * 0.8,
          });
        }
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(({ score: _, ...rest }) => rest);
  }, [interests, news, projects, opps, members, eventsForRecs, explainers, profile?.id, profile?.chapterId, limit]);

  const isLoading =
    newsQuery.isLoading ||
    projectsQuery.isLoading ||
    oppsQuery.isLoading ||
    membersQuery.isLoading ||
    allEventsQuery.isLoading ||
    explainersQuery.isLoading ||
    (Boolean(profile?.chapterId) && chapterEventsQuery.isLoading);

  const error =
    newsQuery.error ??
    projectsQuery.error ??
    oppsQuery.error ??
    membersQuery.error ??
    allEventsQuery.error ??
    explainersQuery.error ??
    chapterEventsQuery.error;

  return { items, isLoading, error };
}
