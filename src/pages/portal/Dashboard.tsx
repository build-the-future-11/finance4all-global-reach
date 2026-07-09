import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNewsArticles } from "@/hooks/portal/useDebriefed";
import { useResearchProjects } from "@/hooks/portal/useLabs";
import { useOpportunities } from "@/hooks/portal/usePathways";
import { useEvents } from "@/hooks/portal/useEvents";
import { useMyLabApplications } from "@/hooks/portal/useLabs";
import { portalNav, portalRoutes } from "@/routes/portal";
import { PortalCard } from "@/components/portal/PortalUI";
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
      <div>
        <p className="text-sm uppercase tracking-widest text-emerald-300/80">Welcome back</p>
        <h1 className="mt-1 text-3xl font-bold text-white">{profile?.displayName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-white/20 text-white/70">
            {profile?.role?.replace("_", " ")}
          </Badge>
          {profile?.openToCollaborate && (
            <Badge className="bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/20">
              Open to collaborate
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "News articles", value: news?.length ?? "—" },
          { label: "Open lab projects", value: projects?.length ?? "—" },
          { label: "Active opportunities", value: opportunities?.length ?? "—" },
          { label: "Upcoming events", value: upcomingEvents },
        ].map((stat) => (
          <PortalCard key={stat.label} className="p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </PortalCard>
        ))}
      </div>

      {myApps && myApps.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Your lab applications</h2>
          <div className="space-y-2">
            {myApps.slice(0, 3).map((app) => (
              <PortalCard key={app.id} className="flex items-center justify-between p-4">
                <span className="text-sm text-white/80">Application submitted</span>
                <Badge variant="outline" className="border-white/20 capitalize text-white/70">
                  {app.status.replace("_", " ")}
                </Badge>
              </PortalCard>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Modules</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {portalNav
            .filter((item) => item.label !== "Dashboard")
            .map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <PortalCard className="group p-5 transition hover:border-white/30 hover:bg-white/[0.07]">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{item.label}</h3>
                        <p className="text-sm text-white/55">{item.description}</p>
                      </div>
                    </div>
                  </PortalCard>
                </Link>
              );
            })}
        </div>
      </section>

      {news && news.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Latest from Debriefed</h2>
            <Link to={portalRoutes.debriefed} className="text-sm text-emerald-300 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {news.slice(0, 3).map((article) => (
              <PortalCard key={article.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{article.title}</p>
                    <p className="mt-1 text-sm text-white/55">{article.summary}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 border-white/20 capitalize text-white/60">
                    {article.category}
                  </Badge>
                </div>
              </PortalCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
