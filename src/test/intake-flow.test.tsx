import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Intake from '@/pages/portal/Intake';
import type { IntakeInput, IntakeSubmission } from '@/lib/intake';

const state=vi.hoisted(()=>({submit:vi.fn(),callsError:null as unknown,calls:[{id:'quant-research',title:'Quant Research',kind:'cohort',status:'interest',description:'A research expression of interest.',closes_at:null,created_at:'2026-09-21'}]}));
vi.mock('@/contexts/useAuth',()=>({useAuth:()=>({user:{id:'test-member'}})}));
vi.mock('@/components/portal/ApplicationDraft',()=>({default:()=>null}));
vi.mock('@/components/portal/ApplicationHistory',()=>({default:()=>null}));
vi.mock('@/hooks/portal/useIntake',()=>({
 useIntakeCalls:()=>({data:state.callsError?undefined:state.calls,error:state.callsError,isLoading:false,refetch:vi.fn()}),
 useIntakeSubmissions:()=>({data:{pages:[[]]},isLoading:false,isSuccess:true,error:null,refetch:vi.fn(),hasNextPage:false}),
 useSubmitIntake:()=>({mutateAsync:state.submit,isPending:false}),
 useReviewIntake:()=>({mutateAsync:vi.fn(),isPending:false}),
}));
function form(){return render(<MemoryRouter initialEntries={['/portal/apply?call=quant-research']}><Intake/></MemoryRouter>);}
function fill(){fireEvent.change(screen.getByLabelText(/Question or contribution/),{target:{value:'Evaluate a chronological baseline with explicit leakage controls, uncertainty and transaction cost assumptions.'}});fireEvent.change(screen.getByLabelText(/Relevant preparation/),{target:{value:'Python, statistics and reproducible data analysis.'}});fireEvent.change(screen.getByLabelText(/Availability and timezone/),{target:{value:'4 hours, UTC'}});fireEvent.click(screen.getByRole('checkbox'));}
beforeEach(()=>{state.callsError=null;state.submit.mockReset();});afterEach(cleanup);
describe('native intake form',()=>{
 it('shows a usable external fallback when deployment lacks the migration',()=>{state.callsError={code:'PGRST205'};form();expect(screen.getByRole('alert')).toHaveTextContent('Nothing has been confirmed');expect(screen.getByRole('link',{name:'Existing application form'})).toHaveAttribute('href','https://tally.so/r/5B7blP');});
 it('rejects whitespace-only answers before reaching storage',async()=>{form();fill();fireEvent.change(screen.getByLabelText(/Question or contribution/),{target:{value:' '.repeat(100)}});fireEvent.submit(screen.getByRole('button',{name:'Submit for review'}).closest('form')!);expect(state.submit).not.toHaveBeenCalled();expect(screen.getByRole('alert')).toHaveTextContent('80 characters');});
 it('retains answers and never confirms failed persistence',async()=>{state.submit.mockRejectedValue(new Error('offline'));form();fill();fireEvent.click(screen.getByRole('button',{name:'Submit for review'}));await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('could not be confirmed'));expect(screen.queryByText('Submission saved')).not.toBeInTheDocument();expect((screen.getByLabelText(/Question or contribution/) as HTMLTextAreaElement).value).toContain('chronological');});
 it('waits for a receipt and suppresses concurrent submissions',async()=>{let complete:(value:unknown)=>void=()=>{};state.submit.mockReturnValue(new Promise(resolve=>{complete=resolve;}));form();fill();const element=screen.getByRole('button',{name:'Submit for review'}).closest('form')!;fireEvent.submit(element);fireEvent.submit(element);expect(state.submit).toHaveBeenCalledTimes(1);expect(screen.queryByText('Submission saved')).not.toBeInTheDocument();complete({id:'receipt-123',status:'submitted'});await waitFor(()=>expect(screen.getByText('Submission saved')).toBeInTheDocument());expect(screen.getByText(/Receipt: receipt-123/)).toBeInTheDocument();});
 it('reuses the request ID on an uncertain retry',async()=>{state.submit.mockRejectedValue(new Error('offline'));form();fill();const button=screen.getByRole('button',{name:'Submit for review'});fireEvent.click(button);await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('could not be confirmed'));fireEvent.click(button);await waitFor(()=>expect(state.submit).toHaveBeenCalledTimes(2));expect(state.submit.mock.calls[0][0].requestId).toBe(state.submit.mock.calls[1][0].requestId);});
});

function storedSubmission(input: IntakeInput, requestId: string): IntakeSubmission {
 return { ...input, id: requestId, applicant_id: 'test-member', work_url: input.work_url || null, privacy_version: '2026-09-21', status: 'submitted', review_note: '', created_at: '2026-10-07T12:00:00Z', updated_at: '2026-10-07T12:00:00Z' };
}

describe('intake retry receipt identity', () => {
 it('distinguishes an earlier saved submission from answers edited before retry', async () => {
  let saved: IntakeSubmission | undefined;
  state.submit.mockImplementation(async ({ input, requestId }: { input: IntakeInput; requestId: string }) => {
   if (!saved) { saved = storedSubmission(input, requestId); throw new Error('The first response was lost'); }
   return saved;
  });
  form(); fill();
  const button = screen.getByRole('button', { name: 'Submit for review' });
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('could not be confirmed'));
  const edited = 'This revised research question includes a different dataset and a stronger chronological comparison while retaining the original evaluation constraints.';
  fireEvent.change(screen.getByLabelText(/Question or contribution/), { target: { value: edited } });
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByText('Submission saved')).toBeInTheDocument());
  expect(screen.getByText(/edits currently shown in the form were not submitted/)).toBeVisible();
  expect(screen.getByLabelText(/Question or contribution/)).toHaveValue(edited);
  expect(state.submit.mock.calls[1][0].requestId).toBe(state.submit.mock.calls[0][0].requestId);
 });

 it('does not report unsent edits when the confirmed receipt matches the submitted answers', async () => {
  state.submit.mockImplementation(async ({ input, requestId }: { input: IntakeInput; requestId: string }) => storedSubmission(input, requestId));
  form(); fill();
  fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }));
  await waitFor(() => expect(screen.getByText('Submission saved')).toBeInTheDocument());
  expect(screen.queryByText(/edits currently shown in the form were not submitted/)).not.toBeInTheDocument();
 });
});
