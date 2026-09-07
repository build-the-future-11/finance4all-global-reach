import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(
  new URL("../supabase/tests/two_identity_rls_certification.sql", import.meta.url),
  "utf8",
);

const publicTables = [
  "account_deletion_requests",
  "chapters",
  "connection_requests",
  "digest_preferences",
  "education_lesson_progress",
  "essay_submissions",
  "essay_upvotes",
  "event_registrations",
  "events",
  "explainer_cards",
  "introduction_posts",
  "lab_applications",
  "news_articles",
  "news_bookmarks",
  "notifications",
  "opportunities",
  "opportunity_interests",
  "profiles",
  "project_bookmarks",
  "research_projects",
  "studio_submissions",
];

test("RLS certification inventories every canonical public table", () => {
  for (const table of publicTables) {
    assert.match(sql, new RegExp(`['\"]${table}['\"]`), `${table} is absent from the inventory`);
  }
  assert.match(sql, /unexpected public tables require explicit certification/);
  assert.match(sql, /public tables without RLS/);
  assert.match(sql, /anonymous role retains public table privileges/);
});

test("RLS certification covers private member data and privileged mutations", () => {
  for (const boundary of [
    "another profile",
    "another digest preference",
    "another member education progress",
    "another member news bookmark",
    "another member project bookmark",
    "another member opportunity interest",
    "another member event registration",
    "another studio submission",
    "another member essay upvote",
    "another introduction",
    "another member lab application",
    "another notification",
    "another research project",
    "awarded an editorial pick",
    "reviewed their own lab application",
    "rewrote the request message",
  ]) {
    assert.ok(sql.includes(boundary), `missing boundary assertion: ${boundary}`);
  }
});

test("RLS certification is rollback-only and does not mutate schema", () => {
  assert.match(sql, /^BEGIN;/m);
  assert.match(sql, /^SET LOCAL ROLE authenticated;/m);
  assert.match(sql, /^RESET ROLE;/m);
  assert.match(sql, /^ROLLBACK;$/m);
  assert.doesNotMatch(sql, /^COMMIT;/m);
  assert.doesNotMatch(sql, /\b(?:DROP|ALTER|TRUNCATE)\s+TABLE\b/i);
  assert.doesNotMatch(sql, /service[_-]?role/i);
});
