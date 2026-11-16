import assert from 'node:assert/strict';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { verifyProduction } from '../scripts/verify-production.mjs';

const revision = '736f24cbe7ff8b1d568abeec9a80610602831d4c';
const securityHeaders = {
  'content-security-policy': "default-src 'self'; frame-ancestors 'none'; object-src 'none'; connect-src 'self' https://pnemeegkwyaicsbnbnmg.supabase.co wss://pnemeegkwyaicsbnbnmg.supabase.co",
  'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

// Local response fixtures only. Resource cleanup must survive an error even
// when a supplied fetch adapter does not implement AbortSignal itself.
function streamingResponse(t, { status = 200, contentType = 'application/json' } = {}) {
  const state = { cancelled: false, chunks: 0 };
  let timer;
  const body = new ReadableStream({
    start(controller) {
      timer = setInterval(() => {
        state.chunks += 1;
        controller.enqueue(new Uint8Array([120]));
      }, 1);
    },
    cancel() {
      state.cancelled = true;
      clearInterval(timer);
    },
  });
  t.after(() => clearInterval(timer));
  return { state, response: new Response(body, { status, headers: { 'content-type': contentType } }) };
}

for (const [label, options, message, decorate] of [
  ['HTTP failure', { status: 503 }, /HTTP 503/, () => {}],
  ['invalid manifest MIME', { contentType: 'text/plain' }, /did not return JSON/, () => {}],
  ['foreign origin', {}, /foreign-origin/, (response) => Object.defineProperty(response, 'url', { value: 'https://other.example/release-revision.json' })],
]) {
  test(`cancels an unread streaming body after ${label}`, async (t) => {
    const { state, response } = streamingResponse(t, options);
    decorate(response);
    let signal;
    await assert.rejects(verifyProduction({
      requestTimeoutMs: 50,
      fetchImpl: async (_input, init) => { signal = init.signal; return response; },
    }), message);
    const chunksAtRejection = state.chunks;
    await delay(8);
    assert.equal(signal.aborted, true, 'failed request must be aborted');
    assert.equal(state.cancelled, true, 'unread body must be cancelled');
    assert.equal(state.chunks, chunksAtRejection, 'body must stop producing after rejection');
  });
}

test('cancels a late response from an adapter that ignores a deadline abort', async (t) => {
  let late;
  let signal;
  await assert.rejects(verifyProduction({
    requestTimeoutMs: 5,
    fetchImpl: async (_input, init) => {
      signal = init.signal;
      await delay(20);
      late = streamingResponse(t, { status: 503 });
      return late.response;
    },
  }), /timed out/);
  await delay(30);
  assert.equal(signal.aborted, true);
  assert.equal(late.state.cancelled, true, 'late body must be cancelled rather than retained');
});

test('cancels an unexpected successful HEAD response body after reading its headers', async (t) => {
  const head = streamingResponse(t, { contentType: 'text/plain' });
  for (const [name, value] of Object.entries(securityHeaders)) head.response.headers.set(name, value);
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(input);
    if (url.pathname === '/release-revision.json') {
      return Response.json({ service: 'financemeta-member-portal', revision });
    }
    if (url.pathname === '/login' && init.method === 'HEAD') return head.response;
    return new Response('<div id="root"></div>', { headers: { 'content-type': 'text/html' } });
  };

  await verifyProduction({ fetchImpl });
  const chunksAtCompletion = head.state.chunks;
  await delay(8);
  assert.equal(head.state.cancelled, true, 'unused HEAD body must be cancelled on success');
  assert.equal(head.state.chunks, chunksAtCompletion, 'unused HEAD body must stop producing after verification');
});
