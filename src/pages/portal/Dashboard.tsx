import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Calendar,
  FlaskConical,
  GraduationCap,
  Library,
  Newspaper,
  Search,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityFeed } from "@/hooks/portal/useActivityFeed";
import { useMyMemberStats } from "@/hooks/portal/useMemberStats";
import { useChapters } from "@/hooks/portal/useEvents";
import { useNewsArticles } from "@/hooks/portal/useDebriefed";
import { useResearchProjects, useMyLabApplications } from "@/hooks/portal/useLabs";
import { useEvents } from "@/hooks/portal/useEvents";
import { portalNav, portalRoutes } from "@/routes/portal";
import {
  CategoryBadge,
  PortalCard,
  PortalHero,
  PortalSection,
  QueryStatus,
  StatCard,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MembershipCard from "@/components/portal/MembershipCard";
import PortalOnboardingChecklist from "@/components/portal/PortalOnboardingChecklist";
import PortalTour from "@/components/portal/PortalTour";
import MemberBadges from "@/components/portal/MemberBadges";
import CommunityPulse from "@/components/portal/CommunityPulse";
import FlagshipInitiatives from "@/components/portal/FlagshipInitiatives";
import { computeMemberBadges } from "@/lib/badges";

const ACTIVITY_ICONS = {
  news: Newspaper,
  lab_application: FlaskConical,
  connection: Users,
  event: Calendar,
  saved_article: Bookmark,
} as const;

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  const { profile } = useAuth();
  const { data: news } = useNewsArticles();
  const { data: projects } = useResearchProjects("open");
  const { data: allProjects } = useResearchProjects("all");
  const { data: events } = useEvents();
  const { data: myApps } = useMyLabApplications();
  const { data: activity, isLoading: activityLoading, error: activityError, refetch } =
    useActivityFeed(6);
  const { data: stats } = useMyMemberStats();
  const { data: chapters } = useChapters();

  const chapterName = chapters?.find((c) => c.id === profile?.chapterId)?.name;
  const memberBadges = computeMemberBadges(profile, stats);

  const isAdmin = profile?.role === "admin";

  const exploreNav = portalNav.filter(
    (item) =>
      item.label !== "Dashboard" &&
      item.label !== "Saved" &&
      (!item.adminOnly || isAdmin),
  );

  const upcomingEvents = events?.filter((e) => e.status === "upcoming").length ?? 0;
  const projectTitleMap = Object.fromEntries(allProjects?.map((p) => [p.id, p.title]) ?? []);

  return (
    <div className="space-y-8">
      <PortalTour />
      <PortalHero
        greeting="Welcome back"
        name={profile?.displayName ?? "Member"}
        badges={
          <>
            <Badge variant="outline" className="border-white/15 capitalize text-white/65">
              {profile?.role?.replace("_", " ")}
            </Badge>
            {profile?.openToCollaborate && (
              <Badge className="border-0 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20">
                Open to collaborate
              </Badge>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          {profile && (
            <MembershipCard profile={profile} chapterName={chapterName} />
          )}
          {profile && <MemberBadges badges={memberBadges} compact />}
        </div>
        <div className="lg:col-span-2">
          <PortalOnboardingChecklist />
        </div>
      </div>

      <CommunityPulse />

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to={portalRoutes.education}>
          <PortalCard hover className="flex items-center gap-3 p-4">
            <GraduationCap className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-white">Education hub</p>
              <p className="text-xs text-white/45">Free Catalyst curriculum</p>
            </div>
          </PortalCard>
        </Link>
        <Link to={portalRoutes.resources}>
          <PortalCard hover className="flex items-center gap-3 p-4">
            <Library className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Resources</p>
              <p className="text-xs text-white/45">Journal, podcasts, toolkits</p>
            </div>
          </PortalCard>
        </Link>
        <Link to={portalRoutes.debriefedExplainers}>
          <PortalCard hover className="flex items-center gap-3 p-4">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">AI assistant</p>
              <p className="text-xs text-white/45">Ask finance questions</p>
            </div>
          </PortalCard>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={portalRoutes.saved}>
          <Button variant="outline" size="sm" className="border-white/20 bg-white/5 text-white">
            <Bookmark className="mr-2 h-3.5 w-3.5" />
            Saved items
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 bg-white/5 text-white"
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
        >
          <Search className="mr-2 h-3.5 w-3.5" />
          Search portal
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="News articles" value={news?.length ?? "—"} icon={Newspaper} accent="emerald" />
        <StatCard label="Open lab projects" value={projects?.length ?? "—"} icon={FlaskConical} accent="blue" />
        <StatCard label="Your connections" value={stats?.connections ?? "—"} icon={Users} accent="amber" />
        <StatCard label="Upcoming events" value={upcomingEvents} icon={Calendar} accent="purple" />
      </div>

      <PortalSection title="Recent activity">
        <QueryStatus
          isLoading={activityLoading}
          error={activityError}
          isEmpty={!activity?.length}
          emptyMessage="Activity will appear here as you browse, save, and connect."
          onRetry={() => refetch()}
          skeletonCount={2}
        >
          <div className="space-y-2">
            {activity?.map((item) => {
              const Icon = ACTIVITY_ICONS[item.type];
              return (
                <Link key={item.id} to={item.link}>
                  <PortalCard hover className="flex items-center gap-4 p-4">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{item.title}</p>
                      <p className="text-xs text-white/45">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-white/30">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </PortalCard>
                </Link>
              );
            })}
          </div>
        </QueryStatus>
      </PortalSection>

      {myApps && myApps.length > 0 && (
        <PortalSection title="Your lab applications">
          <div className="space-y-2">
            {myApps.slice(0, 3).map((app) => (
              <Link key={app.id} to={`${portalRoutes.labs}/${app.projectId}`}>
                <PortalCard hover className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {projectTitleMap[app.projectId] ?? "Research project"}
                    </p>
                    <p className="text-xs text-white/45">
                      Submitted {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <CategoryBadge>{app.status.replace("_", " ")}</CategoryBadge>
                </PortalCard>
              </Link>
            ))}
          </div>
        </PortalSection>
      )}

      <PortalSection title="Flagship initiatives">
        <FlagshipInitiatives />
      </PortalSection>

      <PortalSection title="Explore modules">
        <div className="grid gap-3 md:grid-cols-2">
          {exploreNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <PortalCard hover className="group h-full p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 p-3 text-emerald-300 transition group-hover:from-emerald-500/25">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white">{item.label}</h3>
                      <p className="mt-0.5 text-sm text-white/50">{item.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                  </div>
                </PortalCard>
              </Link>
            );
          })}
        </div>
      </PortalSection>

      {news && news.length > 0 && (
        <PortalSection
          title="Latest from Debriefed"
          action={
            <Link
              to={portalRoutes.debriefed}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              View all →
            </Link>
          }
        >
          <div className="space-y-3">
            {news.slice(0, 3).map((article) => (
              <Link key={article.id} to={portalRoutes.debriefed}>
                <PortalCard hover className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium leading-snug text-white">{article.title}</p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-white/50">{article.summary}</p>
                    </div>
                    <CategoryBadge>{article.category}</CategoryBadge>
                  </div>
                </PortalCard>
              </Link>
            ))}
          </div>
        </PortalSection>
      )}
    </div>
  );
}
