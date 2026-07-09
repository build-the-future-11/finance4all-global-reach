import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Calendar, FlaskConical, Newspaper } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNewsArticles } from "@/hooks/portal/useDebriefed";
import { useResearchProjects, useMyLabApplications } from "@/hooks/portal/useLabs";
import { useOpportunities } from "@/hooks/portal/usePathways";
import { useEvents } from "@/hooks/portal/useEvents";
import { portalNav, portalRoutes } from "@/routes/portal";
import {
  CategoryBadge,
  PortalCard,
  PortalHero,
  PortalSection,
  StatCard,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: news } = useNewsArticles();
  const { data: projects } = useResearchProjects("open");
  const { data: opportunities } = useOpportunities();
  const { data: events } = useEvents();
  const { data: myApps } = useMyLabApplications();

  const upcomingEvents = events?.filter((e) => e.status === "upcoming").length ?? 0;

  return (
    <div className="space-y-8">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="News articles" value={news?.length ?? "—"} icon={Newspaper} accent="emerald" />
        <StatCard label="Open lab projects" value={projects?.length ?? "—"} icon={FlaskConical} accent="blue" />
        <StatCard label="Opportunities" value={opportunities?.length ?? "—"} icon={Briefcase} accent="amber" />
        <StatCard label="Upcoming events" value={upcomingEvents} icon={Calendar} accent="purple" />
      </div>

      {myApps && myApps.length > 0 && (
        <PortalSection title="Your lab applications">
          <div className="space-y-2">
            {myApps.slice(0, 3).map((app) => (
              <PortalCard key={app.id} className="flex items-center justify-between p-4">
                <span className="text-sm text-white/75">Application submitted</span>
                <CategoryBadge>{app.status.replace("_", " ")}</CategoryBadge>
              </PortalCard>
            ))}
          </div>
        </PortalSection>
      )}

      <PortalSection title="Explore modules">
        <div className="grid gap-3 md:grid-cols-2">
          {portalNav
            .filter((item) => item.label !== "Dashboard")
            .map((item) => {
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
              <PortalCard key={article.id} hover className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium leading-snug text-white">{article.title}</p>
                    <p className="mt-1.5 line-clamp-2 text-sm text-white/50">{article.summary}</p>
                  </div>
                  <CategoryBadge>{article.category}</CategoryBadge>
                </div>
              </PortalCard>
            ))}
          </div>
        </PortalSection>
      )}
    </div>
  );
}
