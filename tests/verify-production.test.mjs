import assert from "node:assert/strict";
import test from "node:test";

import { verifyProduction } from "../scripts/verify-production.mjs";

const revision = "736f24cbe7ff8b1d568abeec9a80610602831d4c";
const securityHeaders = {
  "content-security-policy": "default-src 'self'; frame-ancestors 'none'; object-src 'none'; connect-src 'self' https://pnemeegkwyaicsbnbnmg.supabase.co wss://pnemeegkwyaicsbnbnmg.supabase.co",
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

function productionFetch({ service = "financemeta-member-portal", headers = securityHeaders, html = '<div id="root"></div>' } = {}) {
  return async (input, init = {}) => {
    const url = new URL(input);
    if (url.pathname === "/release-revision.json") {
      return new Response(JSON.stringify({ service, revision }), {
        headers: { "content-type": "application/json" },
      });
    }
    if (url.pathname === "/login" && init.method === "HEAD") {
      return new Response(null, { headers });
    }
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  };
}

test("accepts the live portal contract and records its immutable revision", async () => {
  const receipt = await verifyProduction({ fetchImpl: productionFetch() });
  assert.equal(receipt.service, "financemeta-member-portal");
  assert.equal(receipt.revision, revision);
  assert.equal(receipt.routes.length, 4);
});

test("rejects a foreign release identity", async () => {
  await assert.rejects(
    verifyProduction({ fetchImpl: productionFetch({ service: "vertexed" }) }),
    /release service must be financemeta-member-portal/,
  );
});

test("rejects insecure or stale response headers", async () => {
  await assert.rejects(
    verifyProduction({
      fetchImpl: productionFetch({
        headers: {
          ...securityHeaders,
          "content-security-policy": `${securityHeaders["content-security-policy"]} https://fonts.googleapis.com`,
        },
      }),
    }),
    /third-party font infrastructure/,
  );
});

test("rejects a route that no longer returns the application shell", async () => {
  await assert.rejects(
    verifyProduction({ fetchImpl: productionFetch({ html: "<h1>Not found</h1>" }) }),
    /did not return the portal application shell/,
  );
});

// All responses are local fixtures. No production URL or external service is contacted.
function boundaryFetch({ payload = { service: "financemeta-member-portal", revision }, manifestType = "application/json", routeType = "text/html", revisionResponse, routeResponse, inspect } = {}) {
  const fallback = productionFetch();
  return async (input, init = {}) => {
    inspect?.(new URL(input), init);
    if (new URL(input).pathname === "/release-revision.json") {
      return revisionResponse ? revisionResponse() : new Response(JSON.stringify(payload), {
        headers: { "content-type": manifestType },
      });
    }
    if (init.method === "HEAD") return fallback(input, init);
    return routeResponse ? routeResponse() : new Response('<div id="root"></div>', {
      headers: { "content-type": routeType },
    });
  };
}

test("marks an unbound HTTP receipt as observed-only", async () => {
  const receipt = await verifyProduction({ fetchImpl: boundaryFetch() });
  assert.equal(receipt.revisionVerification, "observed-only");
  assert.equal(receipt.expectedRevision, null);
});

test("binds an explicitly expected deployment revision", async () => {
  const receipt = await verifyProduction({ expectedRevision: revision, fetchImpl: boundaryFetch() });
  assert.equal(receipt.expectedRevision, revision);
  assert.equal(receipt.revisionVerification, "exact-match");
});

test("rejects a revision mismatch before checking routes", async () => {
  let calls = 0;
  await assert.rejects(verifyProduction({
    expectedRevision: "a".repeat(40),
    fetchImpl: boundaryFetch({ inspect: () => { calls += 1; } }),
  }), /revision mismatch/);
  assert.equal(calls, 1);
});

test("rejects invalid expected revisions before network I/O", async () => {
  for (const expectedRevision of ["", "abc", "A".repeat(40), [revision], {}, 1, true]) {
    let calls = 0;
    await assert.rejects(verifyProduction({
      expectedRevision, fetchImpl: boundaryFetch({ inspect: () => { calls += 1; } }),
    }), /expected revision must be/);
    assert.equal(calls, 0);
  }
});

test("requires the manifest revision to be a string, without coercion", async () => {
  for (const value of [[revision], [], {}, null, true, 1]) {
    await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({
      payload: { service: "financemeta-member-portal", revision: value },
    }) }), /immutable lowercase Git SHA/);
  }
});

test("requires an object at the manifest root", async () => {
  for (const payload of [null, [], "manifest", true]) {
    await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({ payload }) }), /payload must be an object/);
  }
});

test("requires application/json for the revision endpoint", async () => {
  await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({ manifestType: "text/plain" }) }), /did not return JSON/);
});

test("matches an HTML MIME type exactly", async () => {
  await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({ routeType: "application/x-text/html" }) }), /did not return HTML/);
});

test("accepts MIME case and charset parameters", async () => {
  await verifyProduction({ fetchImpl: boundaryFetch({ manifestType: "Application/JSON; charset=utf-8", routeType: "Text/HTML; charset=utf-8" }) });
});

test("requests reject redirects and carry a cancellation signal", async () => {
  let calls = 0;
  await verifyProduction({ fetchImpl: boundaryFetch({ inspect: (_url, init) => {
    calls += 1;
    assert.equal(init.redirect, "error");
    assert.ok(init.signal instanceof AbortSignal);
    assert.equal(init.headers["cache-control"], "no-cache");
  } }) });
  assert.equal(calls, 6);
});

test("rejects an already-redirected injected response", async () => {
  await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({ revisionResponse: () => {
    const response = Response.json({ service: "financemeta-member-portal", revision });
    Object.defineProperty(response, "redirected", { value: true });
    return response;
  } }) }), /redirected or foreign-origin/);
});

test("rejects a response belonging to a different origin", async () => {
  await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({ revisionResponse: () => {
    const response = Response.json({ service: "financemeta-member-portal", revision });
    Object.defineProperty(response, "url", { value: "https://other.example/release-revision.json" });
    return response;
  } }) }), /redirected or foreign-origin/);
});

test("accepts a same-origin response with a recorded final URL", async () => {
  await verifyProduction({ fetchImpl: boundaryFetch({ revisionResponse: () => {
    const response = Response.json({ service: "financemeta-member-portal", revision });
    Object.defineProperty(response, "url", { value: "https://finance4all-global-reach.vercel.app/release-revision.json" });
    return response;
  } }) });
});

test("preserves HTTP failure handling", async () => {
  await assert.rejects(verifyProduction({ fetchImpl: async () => new Response("Unavailable", { status: 503 }) }), /HTTP 503/);
});

test("validates request deadlines before network I/O", async () => {
  for (const requestTimeoutMs of [0, -1, 1.5, "20", Infinity, NaN, 60_001]) {
    let calls = 0;
    await assert.rejects(verifyProduction({ requestTimeoutMs,
      fetchImpl: boundaryFetch({ inspect: () => { calls += 1; } }),
    }), /request timeout must be/);
    assert.equal(calls, 0);
  }
});

test("bounds a slow fetch even when an injected adapter ignores abort", async () => {
  let signal;
  const fixture = boundaryFetch();
  await assert.rejects(verifyProduction({ requestTimeoutMs: 5,
    fetchImpl: async (input, init) => {
      signal = init.signal;
      await new Promise((resolve) => setTimeout(resolve, 30));
      return fixture(input, init);
    },
  }), /timed out/);
  assert.equal(signal.aborted, true);
});

test("the deadline includes manifest body consumption", async () => {
  await assert.rejects(verifyProduction({ requestTimeoutMs: 5,
    fetchImpl: boundaryFetch({ revisionResponse: () => new Response(new ReadableStream({
      start(controller) {
        setTimeout(() => {
          controller.enqueue(new TextEncoder().encode(JSON.stringify({ service: "financemeta-member-portal", revision })));
          controller.close();
        }, 30);
      },
    }), { headers: { "content-type": "application/json" } }) }),
  }), /timed out/);
});

test("the deadline includes route body consumption", async () => {
  await assert.rejects(verifyProduction({ requestTimeoutMs: 5,
    fetchImpl: boundaryFetch({ routeResponse: () => new Response(new ReadableStream({
      start(controller) {
        setTimeout(() => {
          controller.enqueue(new TextEncoder().encode('<div id="root"></div>'));
          controller.close();
        }, 30);
      },
    }), { headers: { "content-type": "text/html" } }) }),
  }), /timed out/);
});

test("bounds revision response size without trusting Content-Length", async () => {
  await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({
    payload: { service: "financemeta-member-portal", revision, note: "x".repeat(16 * 1024) },
  }) }), /exceeds 16384 bytes/);
});

test("bounds HTML response size", async () => {
  await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({ routeResponse: () =>
    new Response('<div id="root"></div>' + " ".repeat(1024 * 1024), { headers: { "content-type": "text/html" } }),
  }) }), /exceeds 1048576 bytes/);
});

test("rejects invalid UTF-8 rather than replacing malformed bytes", async () => {
  const before = new TextEncoder().encode(`{"service":"financemeta-member-portal","revision":"${revision}","note":"`);
  const after = new TextEncoder().encode('"}');
  const raw = new Uint8Array([...before, 0xff, ...after]);
  await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({ revisionResponse: () =>
    new Response(raw, { headers: { "content-type": "application/json" } }),
  }) }), /encoded data was not valid/);
});

test("handles a UTF-8 character split across stream chunks", async () => {
  const bytes = new TextEncoder().encode(JSON.stringify({ service: "financemeta-member-portal", revision, note: "café" }));
  const split = bytes.indexOf(0xc3) + 1;
  await verifyProduction({ fetchImpl: boundaryFetch({ revisionResponse: () => new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(bytes.slice(0, split));
      controller.enqueue(bytes.slice(split));
      controller.close();
    },
  }), { headers: { "content-type": "application/json" } }) }) });
});

test("a malformed manifest cannot create a receipt", async () => {
  await assert.rejects(verifyProduction({ fetchImpl: boundaryFetch({ revisionResponse: () =>
    new Response('{"broken":', { headers: { "content-type": "application/json" } }),
  }) }));
});

test("CLI rejects missing values before accessing the portal", async () => {
  const { spawnSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const script = fileURLToPath(new URL("../scripts/verify-production.mjs", import.meta.url));
  for (const flag of ["--receipt", "--expected-revision", "--timeout-ms"]) {
    const result = spawnSync(process.execPath, [script, flag], {
      env: { ...process.env, PORTAL_URL: "http://invalid.example" }, encoding: "utf8", timeout: 2000,
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /requires exactly one value/);
    assert.equal(result.stdout, "");
  }
});

test("CLI validates expected-revision environment settings", async () => {
  const { spawnSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const script = fileURLToPath(new URL("../scripts/verify-production.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [script], {
    env: { ...process.env, PORTAL_URL: "http://invalid.example", EXPECTED_DEPLOYED_REVISION: "not-a-sha" },
    encoding: "utf8", timeout: 2000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /expected revision must be/);
});
