import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../supabase/migrations/20260906195000_fix_research_protocol_draft_visibility.sql",
  import.meta.url,
);

async function migrationSql() {
  return readFile(migrationUrl, "utf8");
}

test("protocol SELECT policy inherits parent project visibility", async () => {
  const sql = await migrationSql();

  assert.match(sql, /DROP POLICY IF EXISTS "Protocols follow project visibility"/);
  assert.match(sql, /FOR SELECT\s+TO authenticated/i);
  assert.match(sql, /p\.status <> 'draft'::public\.research_project_status/);
  assert.match(sql, /p\.lead_researcher_id = \(SELECT auth\.uid\(\)\)/);
  assert.match(sql, /financemeta_private\.financemeta_is_admin\(\)/);
});

test("protocol visibility migration fails closed on unreconciled schema or admin helpers", async () => {
  const sql = await migrationSql();

  assert.match(sql, /to_regclass\('public\.research_protocols'\)/);
  assert.match(sql, /FinanceMeta migration history \(#48\)/);
  assert.match(sql, /to_regprocedure\('public\.is_admin\(\)'\)/);
  assert.match(sql, /no supported FinanceMeta admin predicate is installed/);
  assert.doesNotMatch(sql, /USING\s*\(\s*true\s*\)/i);
});
