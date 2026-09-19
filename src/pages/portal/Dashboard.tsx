import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, Briefcase, Calendar, FlaskConical, Newspaper, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useActivityFeed } from "@/hooks/portal/useActivityFeed";
import { useNewsArticles } from "@/hooks/portal/useDebriefed";
import { useResearchProjects, useMyLabApplications } from "@/hooks/portal/useLabs";
import { useOpportunities } from "@/hooks/portal/usePathways";
import { useEvents } from "@/hooks/portal/useEvents";
import { portalRoutes } from "@/routes/portal";
import { PortalCard, QueryStatus } from "@/components/portal/PortalUI";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ACTIVITY_ICONS = {
  news: Newspaper,
  lab_application: FlaskConical,
  connection: Users,
  event: Calendar,
  saved_article: BookOpenText,
} as const;

export default function Dashboard() {
  useDocumentTitle("Home");
  const { profile } = useAuth();
  const { data: news } = useNewsArticles();
  const { data: projects } = useResearchProjects("open");
  const { data: opportunities } = useOpportunities();
  const { data: events } = useEvents();
  const { data: myApps } = useMyLabApplications();
  const { data: activity, isLoading: activityLoading, error: activityError, refetch } = useActivityFeed(6);
  const upcomingEvents = events?.filter((event) => event.status === "upcoming").length ?? 0;

  const nextActions = [
    {
      eyebrow: "Open lesson",
      title: "Continue with Five Foundations",
      copy: "A 35-minute introduction to interest, inflation, diversification, borrowing, and risk.",
      to: "/learn/five-foundations",
      icon: BookOpenText,
      className: "portal-action-primary",
    },
    {
      eyebrow: "FinanceMeta Labs",
      title: projects?.length ? `${projects.length} research ${projects.length === 1 ? "project" : "projects"} open` : "Explore research",
      copy: "Read the question, method, evidence boundary, and application requirements.",
      to: portalRoutes.labs,
      icon: FlaskConical,
      className: "portal-action-dark",
    },
    {
      eyebrow: "Opportunities",
      title: opportunities?.length ? `${opportunities.length} ways to contribute` : "Find your next project",
      copy: "Browse roles, industry work, programmes, and writing challenges.",
      to: portalRoutes.pathways,
      icon: Briefcase,
      className: "portal-action-light",
    },
  ];

  return (
    <div className="portal-dashboard">
      <section className="portal-welcome">
        <div>
          <p className="portal-kicker"><Sparkles className="h-3.5 w-3.5" /> Your member space</p>
          <h1>Good to see you, <em>{profile?.displayName?.split(" ")[0] ?? "Member"}.</em></h1>
          <p>Pick up where you left off, find something useful, or contribute to the wider Finance Meta ecosystem.</p>
        </div>
        <div className="portal-welcome-meta">
          <span>Member since</span>
          <strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "Recently"}</strong>
        </div>
      </section>

      <section aria-labelledby="next-heading">
        <div className="portal-section-title"><div><span>Start here</span><h2 id="next-heading">What would you like to do?</h2></div></div>
        <div className="portal-action-grid">
          {nextActions.map(({ eyebrow, title, copy, to, icon: Icon, className }) => (
            <Link to={to} key={title} className={`portal-action-card ${className}`}>
              <div className="portal-action-top"><span>{eyebrow}</span><Icon className="h-5 w-5" /></div>
              <div><h3>{title}</h3><p>{copy}</p></div>
              <span className="portal-action-link">Open <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="portal-overview" aria-label="Your portal overview">
        {[
          ["Research applications", myApps?.length ?? 0, "Submitted to Labs"],
          ["Upcoming events", upcomingEvents, "Across events and clubs"],
          ["Debriefs", news?.length ?? 0, "Published in your feed"],
          ["Opportunities", opportunities?.length ?? 0, "Currently discoverable"],
        ].map(([label, value, detail], index) => (
          <div key={String(label)}><span>0{index + 1}</span><strong>{value}</strong><p>{label}</p><small>{detail}</small></div>
        ))}
      </section>

      <div className="portal-dashboard-columns">
        <section>
          <div className="portal-section-title"><div><span>Your week</span><h2>Recent activity</h2></div></div>
          <QueryStatus isLoading={activityLoading} error={activityError} isEmpty={!activity?.length} emptyMessage="Your activity will appear here as you learn, save, apply, and connect." onRetry={() => refetch()} skeletonCount={2}>
            <div className="portal-activity-list">
              {activity?.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type];
                return (
                  <Link key={item.id} to={item.link} className="portal-activity-row">
                    <span className="portal-activity-icon"><Icon className="h-4 w-4" /></span>
                    <span><strong>{item.title}</strong><small>{item.description}</small></span>
                    <time>{new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
                  </Link>
                );
              })}
            </div>
          </QueryStatus>
        </section>

        <aside>
          <div className="portal-section-title"><div><span>Discover</span><h2>Inside Finance Meta</h2></div></div>
          <PortalCard className="portal-discover-card">
            <p>Finance for All is the education and outreach initiative inside the wider Finance Meta ecosystem.</p>
            {[
              ["Finance Debriefs", portalRoutes.debriefed],
              ["FinanceMeta Labs", portalRoutes.labs],
              ["Industry projects", portalRoutes.pathwaysStudios],
              ["Events & school clubs", portalRoutes.events],
            ].map(([label, to]) => <Link key={label} to={to}><span>{label}</span><ArrowRight className="h-4 w-4" /></Link>)}
          </PortalCard>
        </aside>
      </div>
    </div>
  );
}
