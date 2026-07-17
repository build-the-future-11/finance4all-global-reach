import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  FlaskConical,
  Newspaper,
  Search,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityFeed } from "@/hooks/portal/useActivityFeed";
import { computeProfileCompleteness, useMyMemberStats } from "@/hooks/portal/useMemberStats";
import { useChapters } from "@/hooks/portal/useEvents";
import { useNewsArticles } from "@/hooks/portal/useDebriefed";
import { useResearchProjects, useMyLabApplications } from "@/hooks/portal/useLabs";
import { portalNav, portalRoutes } from "@/routes/portal";
import {
  CategoryBadge,
  ACTIVITY_ICONS,
  PortalCard,
  PortalHero,
  PortalSection,
  PortalTabsContent,
  PortalTabsList,
  PortalTabsTrigger,
  portalButtonOutline,
  portalLinkClass,
  QueryStatus,
  StatCard,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MembershipCard from "@/components/portal/MembershipCard";
import PortalOnboardingChecklist from "@/components/portal/PortalOnboardingChecklist";
import PortalTour from "@/components/portal/PortalTour";
import MemberBadges from "@/components/portal/MemberBadges";
import CommunityPulse from "@/components/portal/CommunityPulse";
import FlagshipInitiatives from "@/components/portal/FlagshipInitiatives";
import MarketPulseStrip from "@/components/portal/MarketPulseStrip";
import PersonalizedForYou from "@/components/portal/PersonalizedForYou";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import ChapterSpotlight from "@/components/portal/ChapterSpotlight";
import EngagementSummary from "@/components/portal/EngagementSummary";
import SuggestedMembersRail from "@/components/portal/SuggestedMembersRail";
import WeeklyGoalsCard from "@/components/portal/WeeklyGoalsCard";
import LabApplicationsPanel from "@/components/portal/LabApplicationsPanel";
import ParticipationSummary from "@/components/portal/ParticipationSummary";
import { openPortalSearch } from "@/lib/portalSearch";
import { computeMemberBadges } from "@/lib/badges";
import { timeGreeting } from "@/lib/personalization";
import { portalCopy } from "@/lib/portalCopy";

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  const { profile } = useAuth();
  const { data: news } = useNewsArticles();
  const { data: allProjects } = useResearchProjects("all");
  const { data: myApps } = useMyLabApplications();
  const { data: activity, isLoading: activityLoading, error: activityError, refetch } =
    useActivityFeed(6);
  const { data: stats } = useMyMemberStats();
  const { data: chapters } = useChapters();

  const chapterName = chapters?.find((c) => c.id === profile?.chapterId)?.name;
  const memberBadges = computeMemberBadges(profile, stats);
  const { percent } = computeProfileCompleteness(profile);
  const isAdmin = profile?.role === "admin";
  const greeting = timeGreeting();

  const exploreNav = portalNav.filter(
    (item) =>
      item.label !== "Dashboard" &&
      item.label !== "Saved" &&
      item.label !== "Activity" &&
      (!item.adminOnly || isAdmin),
  );

  const openLabs = allProjects?.filter((p) => p.status === "open").length ?? 0;

  return (
    <div className="space-y-6">
      <PortalTour />

      <PortalAnimatedSection>
        <PortalHero
          greeting={greeting}
          name={profile?.displayName ?? "Member"}
          subtitle={
            chapterName
              ? `${chapterName} chapter · ${openLabs} open lab ${openLabs === 1 ? "role" : "roles"} across the network`
              : `Your Finance4All dashboard · ${openLabs} open lab ${openLabs === 1 ? "role" : "roles"}`
          }
          badges={
            <>
              <Badge variant="outline" className="border-white/15 capitalize text-white/65">
                {profile?.role?.replace("_", " ")}
              </Badge>
              {profile?.openToCollaborate && (
                <Badge className="border-0 bg-emerald-500/15 text-emerald-300">
                  Open to collaborate
                </Badge>
              )}
              {percent < 100 && (
                <Link to={portalRoutes.settings}>
                  <Badge className="border-0 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25">
                    Profile {percent}% complete
                  </Badge>
                </Link>
              )}
            </>
          }
        />
      </PortalAnimatedSection>

      <PortalAnimatedSection delay={50}>
        <MarketPulseStrip />
      </PortalAnimatedSection>

      <div className="grid gap-6 lg:grid-cols-3">
        <PortalAnimatedSection className="lg:col-span-1 space-y-4" delay={80}>
          {profile && <MembershipCard profile={profile} chapterName={chapterName} />}
          {profile && <MemberBadges badges={memberBadges} compact />}
        </PortalAnimatedSection>
        <PortalAnimatedSection className="lg:col-span-2" delay={100}>
          <PortalOnboardingChecklist />
        </PortalAnimatedSection>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saved articles" value={stats?.savedArticles ?? "—"} icon={Bookmark} accent="emerald" />
        <StatCard label="Lab applications" value={myApps?.length ?? "—"} icon={FlaskConical} accent="blue" />
        <StatCard label="Connections" value={stats?.connections ?? "—"} icon={Users} accent="amber" />
        <StatCard label="Events registered" value={stats?.eventsRegistered ?? "—"} icon={Calendar} accent="purple" />
      </div>

      <PortalAnimatedSection delay={60}>
        <EngagementSummary />
      </PortalAnimatedSection>

      <div className="flex flex-wrap gap-2">
        <Link to={portalRoutes.saved}>
          <Button variant="outline" size="sm" className={portalButtonOutline}>
            <Bookmark className="mr-2 h-3.5 w-3.5" />
            Saved
          </Button>
        </Link>
        <Link to={portalRoutes.activity}>
          <Button variant="outline" size="sm" className={portalButtonOutline}>
            Activity feed
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className={portalButtonOutline}
          onClick={() => openPortalSearch()}
        >
          <Search className="mr-2 h-3.5 w-3.5" />
          Search ⌘K
        </Button>
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <PortalTabsList>
          <PortalTabsTrigger value="today">Today</PortalTabsTrigger>
          <PortalTabsTrigger value="community">Community</PortalTabsTrigger>
          <PortalTabsTrigger value="explore">All modules</PortalTabsTrigger>
        </PortalTabsList>

        <PortalTabsContent value="today" className="space-y-6">
          <p className="text-sm text-white/50">{portalCopy.dashboard.todayTab}</p>

          <PortalAnimatedSection>
            <WeeklyGoalsCard />
          </PortalAnimatedSection>

          <PortalAnimatedSection>
            <ChapterSpotlight />
          </PortalAnimatedSection>

          <PortalAnimatedSection>
            <PersonalizedForYou />
          </PortalAnimatedSection>

          <PortalSection
            title={portalCopy.dashboardSections.recentActivity}
            action={
              <Link to={portalRoutes.activity} className={portalLinkClass}>
                Full feed →
              </Link>
            }
          >
            <QueryStatus
              isLoading={activityLoading}
              error={activityError}
              isEmpty={!activity?.length}
              emptyMessage={portalCopy.dashboard.activityEmpty}
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

          <PortalAnimatedSection>
            <ParticipationSummary />
          </PortalAnimatedSection>

          <PortalAnimatedSection>
            <LabApplicationsPanel />
          </PortalAnimatedSection>

          <PortalSection
            title={portalCopy.dashboardSections.debriefed}
            action={
              <Link to={portalRoutes.debriefed} className="text-sm text-emerald-400 hover:underline">
                Full news feed →
              </Link>
            }
          >
            {news && news.length > 0 ? (
              <div className="space-y-3">
                {news.slice(0, 3).map((article) => (
                  <Link key={article.id} to={`${portalRoutes.debriefed}?article=${article.id}`}>
                    <PortalCard hover className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium leading-snug text-white">{article.title}</p>
                          <p className="mt-1.5 line-clamp-2 text-sm text-white/50">
                            {article.summary}
                          </p>
                        </div>
                        <CategoryBadge>{article.category}</CategoryBadge>
                      </div>
                    </PortalCard>
                  </Link>
                ))}
              </div>
            ) : (
              <PortalCard className="p-5">
                <p className="text-sm text-white/50">{portalCopy.dashboard.newsEmpty}</p>
                <Link
                  to={portalRoutes.debriefedExplainers}
                  className="mt-2 inline-block text-sm text-emerald-400 hover:underline"
                >
                  Read explainers →
                </Link>
              </PortalCard>
            )}
          </PortalSection>
        </PortalTabsContent>

        <PortalTabsContent value="community" className="space-y-6">
          <p className="text-sm text-white/50">{portalCopy.dashboard.communityTab}</p>
          <CommunityPulse />
          <SuggestedMembersRail />
          <PortalSection title={portalCopy.dashboardSections.flagship}>
            <FlagshipInitiatives />
          </PortalSection>
        </PortalTabsContent>

        <PortalTabsContent value="explore">
          <PortalSection title={portalCopy.dashboardSections.modules}>
            <p className="mb-4 text-sm text-white/50">{portalCopy.dashboard.exploreIntro}</p>
            <p className="mb-4 text-sm text-white/40">{portalCopy.dashboard.exploreTab}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {exploreNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <PortalCard hover className="group h-full p-5">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 p-3 text-emerald-300 transition group-hover:from-emerald-500/25 group-hover:scale-105">
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
        </PortalTabsContent>
      </Tabs>
    </div>
  );
}
