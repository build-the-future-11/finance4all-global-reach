import { describe, expect, it } from 'vitest';
import { intakeSchema, callAcceptsSubmissions, intakeError, type IntakeCall } from '@/lib/intake';
const valid={call_id:'quant-research',motivation:'A research question with a realistic evaluation protocol and explicit limitations. '.repeat(2),preparation:'Python and statistics with reproducible analyses.',availability:'4 hours weekly, UTC',work_url:'https://example.org/work',consent:true};
describe('platform intake validation',()=>{
 it('normalizes answers and rejects whitespace, absent consent and unsafe URLs',()=>{
  expect(intakeSchema.parse({...valid,availability:'  4 hours weekly  '}).availability).toBe('4 hours weekly');
  for(const override of [{motivation:' '.repeat(100)},{consent:false},{work_url:'javascript:alert(1)'},{work_url:'https://user:password@example.org'},{call_id:'../admin'}])expect(intakeSchema.safeParse({...valid,...override}).success).toBe(false);
 });
 it('closes intake at its exact deadline and never accepts a closed call',()=>{
  const call={status:'interest',closes_at:'2026-10-01T12:00:00Z'} as IntakeCall;
  expect(callAcceptsSubmissions(call,Date.parse(call.closes_at!)-1)).toBe(true);
  expect(callAcceptsSubmissions(call,Date.parse(call.closes_at!))).toBe(false);
  expect(callAcceptsSubmissions({...call,status:'closed',closes_at:null})).toBe(false);
 });
 it('missing migrations and network errors never become confirmation',()=>{
  expect(intakeError({code:'PGRST205'})).toContain('Nothing has been confirmed');
  expect(intakeError(new Error('offline'))).toContain('could not be confirmed');
 });
});
