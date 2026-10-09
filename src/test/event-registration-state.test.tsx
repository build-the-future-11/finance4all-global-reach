import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import EventsChapters from '@/pages/portal/events/EventsChapters';

const state = vi.hoisted(() => ({
  registrations: undefined as Set<string> | undefined,
  isSuccess: false,
  isFetching: false,
  error: null as Error | null,
  mutate: vi.fn(),
  refetch: vi.fn(),
  success: vi.fn(),
  failure: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: state.success, error: state.failure } }));
vi.mock('@/components/experience/WorldMap', () => ({ default: () => null }));
vi.mock('@/components/portal/ChapterMap', () => ({ default: () => null }));
vi.mock('@/hooks/portal/useEvents', () => ({
  useChapters: () => ({ data: [], isLoading: false, error: null }),
  useEvents: () => ({ data: [{ id: 'event-1', title: 'Local workshop', startsAt: '2026-10-01T10:00:00Z', chapterId: 'chapter-1', status: 'upcoming', description: 'Test event', programLinks: [] }], isLoading: false, error: null }),
  useEventRegistrations: () => ({ data: state.registrations, isSuccess: state.isSuccess, isFetching: state.isFetching, error: state.error, refetch: state.refetch }),
  useToggleEventRegistration: () => ({ mutateAsync: state.mutate, isPending: false }),
}));
const page = () => <MemoryRouter><EventsChapters /></MemoryRouter>;
beforeEach(() => {
  vi.clearAllMocks();
  state.registrations = undefined;
  state.isSuccess = false;
  state.isFetching = false;
  state.error = null;
  state.mutate.mockResolvedValue(undefined);
});
afterEach(cleanup);

it('does not offer an actionable registration before the membership query succeeds', () => {
  render(page());
  const button = screen.getByRole('button', { name: /Checking registration/ });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(state.mutate).not.toHaveBeenCalled();
  expect(screen.getByText('Local workshop')).toBeVisible();
});
it('keeps failed registration reads distinct from being unregistered and offers retry', () => {
  state.error = new Error('offline');
  render(page());
  expect(screen.getByRole('alert')).toHaveTextContent('Registration status is unavailable');
  expect(screen.getByRole('button', { name: 'Registration unavailable' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry registration status' }));
  expect(state.refetch).toHaveBeenCalledTimes(1);
  expect(state.mutate).not.toHaveBeenCalled();
});
it('disables stale membership state during a failed background refresh', () => {
  state.registrations = new Set(['event-1']);
  state.error = new Error('offline');
  render(page());
  expect(screen.getByRole('button', { name: 'Registration unavailable' })).toBeDisabled();
});
it('recovers to the confirmed registered state and cancels rather than reinserting', async () => {
  const view = render(page());
  state.registrations = new Set(['event-1']);
  state.isSuccess = true;
  view.rerender(page());
  fireEvent.click(screen.getByRole('button', { name: 'Registered' }));
  await waitFor(() => expect(state.mutate).toHaveBeenCalledWith({ eventId: 'event-1', registered: false }));
});
it('blocks repeated clicks while persistence is unresolved', async () => {
  state.registrations = new Set();
  state.isSuccess = true;
  let resolve!: () => void;
  state.mutate.mockReturnValue(new Promise<void>(done => { resolve = done; }));
  render(page());
  const button = screen.getByRole('button', { name: 'Register interest' });
  act(() => { fireEvent.click(button); fireEvent.click(button); });
  expect(state.mutate).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();
  expect(state.success).not.toHaveBeenCalled();
  await act(async () => resolve());
  expect(state.success).toHaveBeenCalledWith("You're registered!");
});
it('unlocks a failed mutation for an honest retry without a success toast', async () => {
  state.registrations = new Set();
  state.isSuccess = true;
  state.mutate.mockRejectedValue(new Error('write failed'));
  render(page());
  fireEvent.click(screen.getByRole('button', { name: 'Register interest' }));
  await waitFor(() => expect(state.failure).toHaveBeenCalledWith('write failed'));
  expect(state.success).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Register interest' })).toBeEnabled();
});
it('does not mutate a cached registration while its refresh is still pending', () => {
  state.registrations = new Set();
  state.isSuccess = true;
  state.isFetching = true;
  render(page());
  expect(screen.getByRole('button', { name: /Checking registration/ })).toBeDisabled();
});
it('uses the refreshed state after successful persistence, including cancellation', async () => {
  state.registrations = new Set();
  state.isSuccess = true;
  const view = render(page());
  fireEvent.click(screen.getByRole('button', { name: 'Register interest' }));
  await waitFor(() => expect(state.success).toHaveBeenCalledTimes(1));
  state.registrations = new Set(['event-1']);
  view.rerender(page());
  fireEvent.click(screen.getByRole('button', { name: 'Registered' }));
  await waitFor(() => expect(state.mutate).toHaveBeenCalledTimes(2));
  expect(state.mutate.mock.calls.map(([input]) => input.registered)).toEqual([true, false]);
});
