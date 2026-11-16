import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Newspaper,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useActivityFeed } from "@/hooks/portal/useActivityFeed";
import { useNewsArticles } from "@/hooks/portal/useDebriefed";
import { useMemberLearning } from "@/hooks/portal/useMemberLearning";
import { useConnectionRequests } from "@/hooks/portal/useNetwork";
import { useEvents } from "@/hooks/portal/useEvents";
import { useMyLabApplications, useResearchProjects } from "@/hooks/portal/useLabs";
import { useOpportunities } from "@/hooks/portal/usePathways";
import { editorialExplainers } from "@/content/editorial";
import { portalRoutes } from "@/routes/portal";
import { PortalCard, QueryStatus } from "@/components/portal/PortalUI";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { memberProjects, projectDeadlines } from "@/lib/workspace";

const ACTIVITY_ICONS = {
  news: Newspaper,
  lab_application: FlaskConical,
  connection: UsersRound,
  event: CalendarDays,
  saved_article: BookOpenText,
} as const;

function loadedCount(value: unknown[] | undefined) {
  return value === undefined ? "—" : value.length;
}

export default function Dashboard() {
  useDocumentTitle("Home");
  const { user, profile } = useAuth();
  const news = useNewsArticles();
  const projects = useResearchProjects();
  const opportunities = useOpportunities();
  const events = useEvents();
  const applications = useMyLabApplications();
  const connections = useConnectionRequests();
  const learning = useMemberLearning().records;
  const activity = useActivityFeed(6);

  const mine = memberProjects(projects.data ?? [], applications.data ?? [], user?.id);
  const deadlines = projectDeadlines(projects.data ?? []);
  const nextDeadline = deadlines[0];
  const upcomingEvents = events.data
    ?.filter((event) => event.status === "upcoming" && Date.parse(event.startsAt) >= Date.now())
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)) ?? [];
  const pendingApplications = applications.data?.filter((application) =>
    application.status === "pending" || application.status === "under_review",
  ) ?? [];
  const incomingConnections = connections.data?.filter((connection) =>
    connection.toUserId === user?.id && connection.status === "pending",
  ) ?? [];
  const completedLessons = learning.data?.filter((record) => record.completed) ?? [];
  const nextLesson = editorialExplainers.find((lesson) =>
    !completedLessons.some((record) => record.lesson_id === lesson.slug),
  );
  const firstName = profile?.displayName?.trim().split(/\s+/)[0] || "Member";

  const quickActions = [
    {
      eyebrow: completedLessons.length ? "Continue learning" : "Start learning",
      title: nextLesson?.title ?? "Review your learning notes",
      copy: nextLesson
        ? `${nextLesson.readMinutes} min · Continue with the next evidence-led explainer.`
        : "You have marked every current explainer read. Revisit your private notes.",
      to: nextLesson ? `${portalRoutes.debriefedExplainers}/${nextLesson.slug}` : portalRoutes.learning,
      icon: BookOpenText,
      className: "portal-action-primary",
    },
    {
      eyebrow: "Your research",
      title: mine.length ? `${mine.length} active ${mine.length === 1 ? "project" : "projects"}` : "Find a research question",
      copy: mine.length
        ? "Open the work you lead or joined and check its current commitments."
        : "Explore open methods, evidence boundaries, and participation requirements.",
      to: mine.length ? portalRoutes.myResearch : portalRoutes.labs,
      icon: FlaskConical,
      className: "portal-action-dark",
    },
    {
      eyebrow: "Community",
      title: incomingConnections.length
        ? `${incomingConnections.length} ${incomingConnections.length === 1 ? "request" : "requests"} waiting`
        : "Find your collaborators",
      copy: "Meet members by interests, research questions, and what they want to build next.",
      to: portalRoutes.network,
      icon: UsersRound,
      className: "portal-action-light",
    },
  ];

  return (
    <div className="portal-dashboard">
      <section className="portal-welcome portal-welcome-upgraded">
        <div>
          <p className="portal-kicker"><Sparkles className="h-3.5 w-3.5" /> Your member workspace</p>
          <h1>Welcome back, <em>{firstName}.</em></h1>
          <p>Continue your work, respond to what needs attention, or discover your next contribution.</p>
          <div className="portal-welcome-actions">
            <Link to={portalRoutes.myResearch}>Open my research <ArrowRight className="h-4 w-4" /></Link>
            <Link to={portalRoutes.apply}>View applications</Link>
          </div>
        </div>
        <div className="portal-member-status" aria-label="Member status">
          <span><i aria-hidden="true" /> Signed in</span>
          <strong>{profile?.role.replaceAll("_", " ") ?? "member"}</strong>
          <small>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "recently"}</small>
        </div>
      </section>

      <section className="portal-focus-strip" aria-label="Your current priorities">
        <div><span>Current work</span><strong>{projects.isLoading || applications.isLoading ? "—" : mine.length}</strong><small>{mine.length === 1 ? "active project" : "active projects"}</small></div>
        <div><span>Awaiting response</span><strong>{connections.isLoading ? "—" : incomingConnections.length}</strong><small>{incomingConnections.length === 1 ? "connection request" : "connection requests"}</small></div>
        <div><span>Next deadline</span><strong>{projects.isLoading ? "—" : nextDeadline ? new Date(nextDeadline.applicationDeadline!).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "None"}</strong><small>{nextDeadline?.title ?? "No confirmed deadline"}</small></div>
      </section>

      <section aria-labelledby="next-heading">
        <div className="portal-section-title"><div><span>Pick up the thread</span><h2 id="next-heading">Your next move</h2></div></div>
        <div className="portal-action-grid">
          {quickActions.map(({ eyebrow, title, copy, to, icon: Icon, className }) => (
            <Link to={to} key={eyebrow} className={`portal-action-card ${className}`}>
              <div className="portal-action-top"><span>{eyebrow}</span><Icon className="h-5 w-5" /></div>
              <div><h3>{title}</h3><p>{copy}</p></div>
              <span className="portal-action-link">Open <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      <div className="portal-dashboard-columns portal-priority-layout">
        <section aria-labelledby="work-heading">
          <div className="portal-section-title"><div><span>Account scoped</span><h2 id="work-heading">Your research</h2></div><Link to={portalRoutes.myResearch}>View all <ArrowRight className="h-4 w-4" /></Link></div>
          <QueryStatus
            isLoading={projects.isLoading || applications.isLoading}
            error={projects.error || applications.error}
            onRetry={() => { void projects.refetch(); void applications.refetch(); }}
            isEmpty={!mine.length}
            emptyMessage="No project participation is recorded yet. Explore a project and review its requirements before applying."
            skeletonCount={2}
          >
            <div className="portal-work-list">
              {mine.slice(0, 3).map((project) => (
                <Link key={project.id} to={`${portalRoutes.labs}/${project.id}`} className="portal-work-row">
                  <span className="portal-work-icon"><FlaskConical className="h-4 w-4" /></span>
                  <span><small>{project.leadResearcherId === user?.id ? "Project lead" : "Accepted participant"}</small><h3>{project.title}</h3><p>{project.tags.length ? project.tags.join(" · ") : "Research workspace"}</p></span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </QueryStatus>
        </section>

        <aside aria-labelledby="attention-heading">
          <div className="portal-section-title"><div><span>At a glance</span><h2 id="attention-heading">Needs attention</h2></div></div>
          <PortalCard className="portal-attention-card">
            <Link to={portalRoutes.apply}><span><Clock3 className="h-4 w-4" /><b>Applications in review</b></span><strong>{applications.isLoading ? "—" : pendingApplications.length}</strong></Link>
            <Link to={portalRoutes.network}><span><UsersRound className="h-4 w-4" /><b>Connection requests</b></span><strong>{connections.isLoading ? "—" : incomingConnections.length}</strong></Link>
            <Link to={portalRoutes.events}><span><CalendarDays className="h-4 w-4" /><b>Upcoming events</b></span><strong>{events.isLoading ? "—" : upcomingEvents.length}</strong></Link>
            <Link to={portalRoutes.learning}><span><CheckCircle2 className="h-4 w-4" /><b>Lessons marked read</b></span><strong>{learning.isLoading ? "—" : completedLessons.length}</strong></Link>
          </PortalCard>
        </aside>
      </div>

      <section className="portal-overview" aria-label="Explore the portal">
        {[
          ["Open projects", projects.data?.filter((project) => project.status === "open"), "Questions accepting applications", portalRoutes.labs, BriefcaseBusiness],
          ["Upcoming events", upcomingEvents, "Confirmed future sessions", portalRoutes.events, CalendarDays],
          ["Debriefs", news.data, "Published evidence-led reading", portalRoutes.debriefed, Newspaper],
          ["Opportunities", opportunities.data, "Currently discoverable", portalRoutes.pathways, BookOpenText],
        ].map(([label, values, detail, to, Icon], index) => {
          const CountIcon = Icon as typeof BriefcaseBusiness;
          return <Link to={String(to)} key={String(label)}><span>0{index + 1}</span><CountIcon className="h-4 w-4" /><strong>{loadedCount(values as unknown[] | undefined)}</strong><p>{String(label)}</p><small>{String(detail)}</small></Link>;
        })}
      </section>

      <div className="portal-dashboard-columns">
        <section>
          <div className="portal-section-title"><div><span>Your account</span><h2>Recent activity</h2></div></div>
          <QueryStatus isLoading={activity.isLoading} error={activity.error} isEmpty={!activity.data?.length} emptyMessage="Your activity will appear here as you learn, save, apply, and connect." onRetry={() => void activity.refetch()} skeletonCount={2}>
            <div className="portal-activity-list">
              {activity.data?.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type];
                return <Link key={item.id} to={item.link} className="portal-activity-row"><span className="portal-activity-icon"><Icon className="h-4 w-4" /></span><span><strong>{item.title}</strong><small>{item.description}</small></span><time>{new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></Link>;
              })}
            </div>
          </QueryStatus>
        </section>

        <aside>
          <div className="portal-section-title"><div><span>Coming up</span><h2>Next event</h2></div></div>
          <PortalCard className="portal-next-event">
            {events.isLoading ? <p>Loading confirmed events…</p> : upcomingEvents[0] ? <>
              <CalendarDays className="h-5 w-5" />
              <time dateTime={upcomingEvents[0].startsAt}>{new Date(upcomingEvents[0].startsAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time>
              <h3>{upcomingEvents[0].title}</h3>
              <Link to={`${portalRoutes.events}?selected=${encodeURIComponent(upcomingEvents[0].id)}`}>View event <ArrowRight className="h-4 w-4" /></Link>
            </> : <><CalendarDays className="h-5 w-5" /><h3>No confirmed event yet</h3><p>Browse chapters and return when a future session is published.</p><Link to={portalRoutes.events}>Explore events <ArrowRight className="h-4 w-4" /></Link></>}
          </PortalCard>
        </aside>
      </div>
    </div>
  );
}
