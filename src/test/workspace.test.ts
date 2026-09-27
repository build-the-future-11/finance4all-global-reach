import { describe, it, expect } from 'vitest';
import { memberProjects, projectDeadlines } from '@/lib/workspace';
import type { LabApplication, ResearchProject } from '@/types/domain';

const project = (id: string, leadResearcherId = 'someone'): ResearchProject => ({ id, leadResearcherId, title: id, description: '', status: 'open', tags: [], createdAt: '', updatedAt: '' });
const application = (projectId: string, status: LabApplication['status'], applicantId = 'me'): LabApplication => ({ id: projectId, projectId, applicantId, status, motivation: '', submittedAt: '' });
describe('member workspace evidence', () => {
  it('shows only led projects or accepted participation for the current identity', () => {
    const projects = [project('led', 'me'), project('accepted'), project('pending'), project('other')];
    const apps = [application('accepted', 'accepted'), application('pending', 'pending'), application('other', 'accepted', 'another-member')];
    expect(memberProjects(projects, apps, 'me').map(p => p.id)).toEqual(['led', 'accepted']);
    expect(memberProjects(projects, apps, undefined)).toEqual([]);
  });
  it('sorts only valid future deadlines on open projects', () => {
    const projects = [
      { ...project('late'), applicationDeadline: '2026-10-03T12:00:00Z' },
      { ...project('early'), applicationDeadline: '2026-10-02T12:00:00Z' },
      { ...project('past'), applicationDeadline: '2026-09-01T12:00:00Z' },
      { ...project('invalid'), applicationDeadline: 'not a date' },
      { ...project('closed'), status: 'closed' as const, applicationDeadline: '2026-10-02T12:00:00Z' },
    ];
    expect(projectDeadlines(projects, Date.parse('2026-10-01')).map(p => p.id)).toEqual(['early', 'late']);
  });
});
