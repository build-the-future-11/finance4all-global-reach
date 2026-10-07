import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useMyLabApplications, useResearchProjects, useReviewQueue } from '@/hooks/portal/useLabs';
import { useEvents } from '@/hooks/portal/useEvents';
import { useSavedProjects } from '@/hooks/portal/useBookmarks';
import { useIntakeSubmissions } from '@/hooks/portal/useIntake';
import { useConnectionRequests } from '@/hooks/portal/useNetwork';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PortalPageHeader, QueryStatus, CategoryBadge } from '@/components/portal/PortalUI';
import { portalRoutes } from '@/routes/portal';
import { memberProjects, projectDeadlines } from '@/lib/workspace';

export function MyResearch() {
  useDocumentTitle('My Research');
  const { user } = useAuth();
  const projects = useResearchProjects();
  const applications = useMyLabApplications();
  const mine = memberProjects(projects.data ?? [], applications.data ?? [], user?.id);
  return <div className="research-workspace"><PortalPageHeader eyebrow="Workspace / Your work" title="My Research" description="Projects you lead or have an accepted application to. Pending applications are tracked separately." action={<Link className="workspace-action" to={portalRoutes.labs}>Explore projects →</Link>} /><QueryStatus isLoading={projects.isLoading || applications.isLoading} error={projects.error || applications.error} onRetry={() => { void projects.refetch(); void applications.refetch(); }} isEmpty={!mine.length} emptyMessage="No project participation is recorded yet. Explore a project and read its application requirements."><div className="workspace-records">{mine.map(p => <Link className="workspace-row" key={p.id} to={portalRoutes.labs + '/' + p.id}><div><h2>{p.title}</h2><p>{p.description}</p><small>{p.leadResearcherId === user?.id ? 'Project lead' : 'Accepted participant'}</small></div><CategoryBadge>{p.status}</CategoryBadge></Link>)}</div></QueryStatus><section><h2>Research applications</h2><QueryStatus isLoading={applications.isLoading} error={applications.error} onRetry={() => void applications.refetch()} isEmpty={!applications.data?.length} emptyMessage="No research applications have been submitted.">{applications.data?.map(a => <Link className="workspace-row" to={portalRoutes.labs + '/' + a.projectId} key={a.id}><div><h3>{projects.data?.find(p => p.id === a.projectId)?.title ?? 'View project application'}</h3><p>Submitted {new Date(a.submittedAt).toLocaleDateString()}</p></div><CategoryBadge>{a.status.replaceAll('_', ' ')}</CategoryBadge></Link>)}</QueryStatus></section></div>;
}

export default function ResearchWorkspace() {
  useDocumentTitle('Research workspace');
  const { user, profile } = useAuth();
  const projects = useResearchProjects();
  const applications = useMyLabApplications();
  const intake = useIntakeSubmissions();
  const events = useEvents();
  const saved = useSavedProjects();
  const reviews = useReviewQueue();
  const connections = useConnectionRequests();
  const mine = memberProjects(projects.data ?? [], applications.data ?? [], user?.id);
  const deadlines = projectDeadlines(projects.data ?? []).slice(0, 4);
  const upcoming = events.data?.filter(e => e.status === 'upcoming' && Date.parse(e.startsAt) >= Date.now()).slice(0, 4) ?? [];
  const receipts = intake.data?.pages.flat().slice(0, 5) ?? [];
  const pendingConnections = connections.data?.filter(c => c.toUserId === user?.id && c.status === 'pending') ?? [];
  const canReview = profile?.role === 'admin' || profile?.role === 'lead_researcher';
  return <div className="research-workspace">
    <PortalPageHeader eyebrow="Your research workspace" title={`Welcome${profile?.displayName ? ', ' + profile.displayName.split(' ')[0] : ''}.`} description="Your work, applications and next commitments, in one place." action={<Link className="workspace-action" to={portalRoutes.apply}>Start an application →</Link>} />
    <section><div className="workspace-heading"><h2>Current projects</h2><Link to={portalRoutes.myResearch}>My Research →</Link></div><QueryStatus isLoading={projects.isLoading || applications.isLoading} error={projects.error || applications.error} onRetry={() => { void projects.refetch(); void applications.refetch(); }} isEmpty={!mine.length} emptyMessage="No project participation is recorded. Find a research question and apply to contribute.">{mine.slice(0, 4).map(p => <Link className="workspace-row" to={portalRoutes.labs + '/' + p.id} key={p.id}><div><h3>{p.title}</h3><p>{p.tags.join(' · ')}</p></div><CategoryBadge>{p.leadResearcherId === user?.id ? 'Leading' : 'Accepted'}</CategoryBadge></Link>)}</QueryStatus></section>
    <div className="workspace-columns"><section><div className="workspace-heading"><h2>Recent applications</h2><Link to={portalRoutes.apply}>All receipts →</Link></div><QueryStatus isLoading={intake.isLoading} error={intake.error} onRetry={() => void intake.refetch()} isEmpty={!receipts.length} emptyMessage="No platform applications submitted yet. Research project applications are listed in My Research.">{receipts.map(r => <Link className="workspace-row" key={r.id} to={portalRoutes.apply}><div><h3>{r.call_id.replaceAll('-', ' ')}</h3><p>{new Date(r.created_at).toLocaleDateString()}</p></div><CategoryBadge>{r.status.replaceAll('_', ' ')}</CategoryBadge></Link>)}</QueryStatus></section>
    <section><h2>Application deadlines</h2><p className="workspace-caption">Open project deadlines, shown in your local timezone.</p><QueryStatus isLoading={projects.isLoading} error={projects.error} onRetry={() => void projects.refetch()} isEmpty={!deadlines.length} emptyMessage="No confirmed upcoming project deadlines are listed.">{deadlines.map(p => <Link className="workspace-row" key={p.id} to={portalRoutes.labs + '/' + p.id}><h3>{p.title}</h3><time dateTime={p.applicationDeadline}>{new Date(p.applicationDeadline!).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time></Link>)}</QueryStatus></section></div>
    {canReview && <section><div className="workspace-heading"><h2>Review requests</h2><Link to={portalRoutes.labsReview}>Review workspace →</Link></div><QueryStatus isLoading={reviews.isLoading} error={reviews.error} onRetry={() => void reviews.refetch()} isEmpty={!reviews.data?.length} emptyMessage="No research applications are waiting for your review.">{reviews.data?.slice(0, 5).map(r => <Link className="workspace-row" key={r.id} to={portalRoutes.labsReview}><h3>{r.projectTitle}</h3><CategoryBadge>{r.status.replaceAll('_', ' ')}</CategoryBadge></Link>)}</QueryStatus>{profile?.role === 'admin' && <Link className="workspace-action" to={portalRoutes.intakeReview}>Review platform intake →</Link>}</section>}
    <div className="workspace-columns"><section><div className="workspace-heading"><h2>Upcoming events</h2><Link to={portalRoutes.events}>Events →</Link></div><QueryStatus isLoading={events.isLoading} error={events.error} onRetry={() => void events.refetch()} isEmpty={!upcoming.length} emptyMessage="No upcoming events are confirmed.">{upcoming.map(e => <Link className="workspace-row" key={e.id} to={portalRoutes.events + '?selected=' + e.id}><div><h3>{e.title}</h3><time dateTime={e.startsAt}>{new Date(e.startsAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} · local time</time></div></Link>)}</QueryStatus></section>
    <section><div className="workspace-heading"><h2>Saved research</h2><Link to={portalRoutes.saved}>All saved →</Link></div><QueryStatus isLoading={saved.isLoading} error={saved.error} onRetry={() => void saved.refetch()} isEmpty={!saved.data?.length} emptyMessage="Save a project to keep its question close at hand.">{saved.data?.slice(0, 4).map(({ project }) => <Link className="workspace-row" key={project.id} to={portalRoutes.labs + '/' + project.id}><h3>{project.title}</h3><span aria-hidden="true">→</span></Link>)}</QueryStatus></section></div>
    <section><div className="workspace-heading"><h2>Collaborators & introductions</h2><Link to={portalRoutes.network}>People →</Link></div><QueryStatus isLoading={connections.isLoading} error={connections.error} onRetry={() => void connections.refetch()}><p>{pendingConnections.length ? `${pendingConnections.length} incoming connection ${pendingConnections.length === 1 ? 'request awaits' : 'requests await'} your response.` : 'No incoming connection requests. Visit the member directory to find people with shared research interests.'}</p></QueryStatus></section>
  </div>;
}
