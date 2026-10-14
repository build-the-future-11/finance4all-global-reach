import type { LabApplication, ResearchProject } from '@/types/domain';

/** Accepted applications are participation evidence; pending interest is not. */
export function memberProjects(projects: ResearchProject[], applications: LabApplication[], userId?: string) {
  if (!userId) return [];
  const accepted = new Set(applications.filter(a => a.applicantId === userId && a.status === 'accepted').map(a => a.projectId));
  return projects.filter(p => p.leadResearcherId === userId || accepted.has(p.id));
}

export function projectDeadlines(projects: ResearchProject[], now = Date.now()) {
  return projects.filter(p => p.status === 'open' && p.applicationDeadline && Date.parse(p.applicationDeadline) >= now)
    .sort((a, b) => Date.parse(a.applicationDeadline!) - Date.parse(b.applicationDeadline!));
}
