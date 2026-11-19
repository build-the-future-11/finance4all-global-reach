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
import { useSavedExplainers } from "@/hooks/portal/useSavedExplainers";
import { useReadingHistory } from "@/hooks/portal/useReadingHistory";
import { useIntakeSubmissions } from "@/hooks/portal/useIntake";
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
  useDocumentTitle("Dashboard");
  const { user, profile } = useAuth();
  const news = useNewsArticles();
  const projects = useResearchProjects();
  const opportunities = useOpportunities();
  const events = useEvents();
  const applications = useMyLabApplications();
  const connections = useConnectionRequests();
  const learning = useMemberLearning().records;
  const activity = useActivityFeed(6);
  const savedReading = useSavedExplainers();
  const readingHistory = useReadingHistory();
  const intake = useIntakeSubmissions();

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
  const completedLessonIds = new Set([
    ...(learning.data?.filter((record) => record.completed).map(record => record.lesson_id) ?? []),
    ...readingHistory.entries.filter(entry => entry.completed).map(entry => entry.slug),
  ]);
  const recentReading = readingHistory.continueReading[0];
  const nextLesson = recentReading?.article ?? editorialExplainers.find((lesson) =>
    !completedLessonIds.has(lesson.slug),
  );
  const firstName = profile?.displayName?.trim().split(/\s+/)[0] || "Member";
  const starterSteps = [
    {
      title: "Make your profile useful",
      detail: profile?.bio?.trim() || (profile?.interests?.length ?? 0)
        ? "Your interests help other members understand what you want to explore."
        : "Add a short bio or interests so future collaborators have context.",
      to: portalRoutes.settings,
      status: profile?.bio?.trim() || (profile?.interests?.length ?? 0) ? "done" : "ready",
    },
    {
      title: "Read one evidence-led explainer",
      detail: completedLessonIds.size
        ? `${completedLessonIds.size} ${completedLessonIds.size === 1 ? "explainer is" : "explainers are"} marked read. Keep your notes close.`
        : "Start with a short explainer and save an idea worth returning to.",
      to: nextLesson ? `${portalRoutes.debriefedExplainers}/${nextLesson.slug}` : portalRoutes.learning,
      status: learning.data === undefined || readingHistory.error ? "loading" : completedLessonIds.size ? "done" : "ready",
    },
    {
      title: "Choose a research direction",
      detail: projects.data === undefined || applications.data === undefined
        ? "Checking your research workspace."
        : mine.length
          ? `You already have ${mine.length} ${mine.length === 1 ? "project" : "projects"} in your workspace.`
          : "Browse questions, methods and participation requirements before you apply.",
      to: mine.length ? portalRoutes.myResearch : portalRoutes.labs,
      status: projects.data === undefined || applications.data === undefined ? "loading" : mine.length ? "done" : "ready",
    },
  ] as const;
  const completedStarterSteps = starterSteps.filter((step) => step.status === "done").length;

  const quickActions = [
    {
      eyebrow: completedLessonIds.size ? "Continue learning" : "Start learning",
      title: nextLesson?.title ?? "Review your learning notes",
      copy: nextLesson
        ? `${nextLesson.readMinutes} min · Continue with the next evidence-led explainer.`
        : "You have marked every current explainer read. Revisit your private notes.",
      to: nextLesson ? `${portalRoutes.debriefedExplainers}/${nextLesson.slug}${recentReading ? `#${recentReading.section}` : ""}` : portalRoutes.learning,
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
          <small>{profile?.createdAt ? `Member since ${new Date(profile.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}` : "Account profile loading"}</small>
        </div>
      </section>

      <section className="portal-focus-strip" aria-label="Your current priorities">
        <div><span>Current work</span><strong>{projects.data === undefined || applications.data === undefined ? "—" : mine.length}</strong><small>{mine.length === 1 ? "active project" : "active projects"}</small></div>
        <div><span>Awaiting response</span><strong>{connections.data === undefined ? "—" : incomingConnections.length}</strong><small>{incomingConnections.length === 1 ? "connection request" : "connection requests"}</small></div>
        <div><span>Next deadline</span><strong>{projects.data === undefined ? "—" : nextDeadline ? new Date(nextDeadline.applicationDeadline!).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "None"}</strong><small>{nextDeadline?.title ?? "No confirmed deadline"}</small></div>
      </section>

      <section className="portal-starting-points" aria-labelledby="starting-points-heading">
        <div className="portal-section-title">
          <div><span>Make this space yours</span><h2 id="starting-points-heading">A clear place to begin</h2></div>
          <p><strong>{completedStarterSteps}/3</strong> foundation steps complete</p>
        </div>
        <ol>
          {starterSteps.map((step, index) => (
            <li key={step.title} data-status={step.status}>
              <span className="portal-starting-step-number" aria-hidden="true">{step.status === "done" ? <CheckCircle2 className="h-4 w-4" /> : `0${index + 1}`}</span>
              <div><h3>{step.title}</h3><p>{step.detail}</p></div>
              <Link to={step.to}>{step.status === "done" ? "Review" : step.status === "loading" ? "View" : "Start"}<ArrowRight className="h-4 w-4" /></Link>
            </li>
          ))}
        </ol>
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
            <Link to={portalRoutes.apply}><span><Clock3 className="h-4 w-4" /><b>Applications in review</b></span><strong>{applications.data === undefined ? "—" : pendingApplications.length}</strong></Link>
            <Link to={portalRoutes.network}><span><UsersRound className="h-4 w-4" /><b>Connection requests</b></span><strong>{connections.data === undefined ? "—" : incomingConnections.length}</strong></Link>
            <Link to={portalRoutes.events}><span><CalendarDays className="h-4 w-4" /><b>Upcoming events</b></span><strong>{events.data === undefined ? "—" : upcomingEvents.length}</strong></Link>
            <Link to={portalRoutes.learning}><span><CheckCircle2 className="h-4 w-4" /><b>Lessons marked read</b></span><strong>{learning.data === undefined || readingHistory.error ? "—" : completedLessonIds.size}</strong></Link>
          </PortalCard>
        </aside>
      </div>

      <div className="portal-dashboard-columns">
        <section aria-labelledby="reading-home-heading">
          <div className="portal-section-title"><div><span>Your reading room</span><h2 id="reading-home-heading">Saved & in progress</h2></div><Link to={portalRoutes.saved}>View saved content <ArrowRight size={16} /></Link></div>
          {readingHistory.continueReading.length === 0 && savedReading.articles.length === 0 ? <PortalCard className="p-6"><h3 className="font-serif text-xl">Keep a useful idea close.</h3><p className="mt-2 text-sm text-muted-foreground">Save an explainer or remember your place while reading. Your library belongs to your account.</p><Link to={portalRoutes.debriefed} className="mt-4 inline-block underline">Explore Finance Debriefed →</Link></PortalCard> : <div className="portal-work-list">{readingHistory.continueReading.slice(0, 2).map(entry => <Link key={entry.slug} className="portal-work-row" to={`${portalRoutes.debriefedExplainers}/${entry.slug}#${entry.section}`}><span><small>Continue reading · saved position</small><h3>{entry.article.title}</h3><p>{entry.article.readMinutes} min read</p></span><ArrowRight size={16} /></Link>)}{savedReading.articles.filter(article => !readingHistory.continueReading.some(entry => entry.slug === article.slug)).slice(0, 3).map(article => <Link key={article.slug} className="portal-work-row" to={`${portalRoutes.debriefedExplainers}/${article.slug}`}><span><small>Saved for later</small><h3>{article.title}</h3></span><ArrowRight size={16} /></Link>)}</div>}
        </section>
        <section aria-labelledby="application-home-heading"><div className="portal-section-title"><div><span>Private receipts</span><h2 id="application-home-heading">Your applications</h2></div><Link to={portalRoutes.apply}>View all <ArrowRight size={16} /></Link></div><QueryStatus isLoading={intake.isLoading} error={intake.error} onRetry={() => void intake.refetch()} isEmpty={!intake.data?.pages.flat().length} emptyMessage="No application receipts are recorded. Explore programs to understand their current availability.">{intake.data?.pages.flat().slice(0, 3).map(submission => <Link className="portal-work-row" to={portalRoutes.apply} key={submission.id}><span><h3>{submission.call_id.replaceAll("-", " ")}</h3><p>{submission.status.replaceAll("_", " ")} · {new Date(submission.created_at).toLocaleDateString()}</p></span><ArrowRight size={16} /></Link>)}</QueryStatus><Link className="mt-4 inline-block text-sm underline" to={portalRoutes.programs}>Explore programs and requirements →</Link></section>
      </div>

      <section className="portal-overview" aria-label="Explore the portal">
        {[
          ["Open projects", projects.data?.filter((project) => project.status === "open"), "Questions accepting applications", portalRoutes.labs, BriefcaseBusiness],
          ["Upcoming events", events.data === undefined ? undefined : upcomingEvents, "Confirmed future sessions", portalRoutes.events, CalendarDays],
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
            {events.isLoading ? <p>Loading confirmed events…</p> : events.error ? <p role="alert">Events could not be loaded. <button className="underline" onClick={() => void events.refetch()}>Retry</button></p> : upcomingEvents[0] ? <>
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
