import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/012_operational_integrity.sql"),
  "utf8",
);
const weeklyDigestFunction = readFileSync(
  join(process.cwd(), "supabase/functions/weekly-digest/index.ts"),
  "utf8",
);
const deleteAccountFunction = readFileSync(
  join(process.cwd(), "supabase/functions/delete-account/index.ts"),
  "utf8",
);

describe("operational integrity migration", () => {
  it("deduplicates weekly digest sends by member and week", () => {
    expect(migration).toContain("CREATE UNIQUE INDEX IF NOT EXISTS digest_send_log_user_period");
    expect(migration).toContain("ON digest_send_log (user_id, period_start)");
  });

  it("keeps telemetry bounded, authenticated, and private by default", () => {
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS product_analytics_events");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION track_product_event");
    expect(migration).toContain("p_event_name NOT IN");
    expect(migration).toContain("octet_length(p_properties::text) > 2048");
    expect(migration).toContain("REVOKE ALL ON TABLE product_analytics_events FROM PUBLIC, anon, authenticated");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION track_product_event(TEXT, JSONB) TO authenticated");
  });

  it("freezes member-content ownership and editorial fields", () => {
    expect(migration).toContain("validate_connection_request");
    expect(migration).toContain("NEW.from_user_id IS DISTINCT FROM OLD.from_user_id");
    expect(migration).toContain("Only the recipient can accept or decline a pending connection");
    expect(migration).toContain("Only an administrator can select an editorial pick");
    expect(migration).toContain("WITH CHECK (author_id = (SELECT auth.uid()))");
  });

  it("defines a private operational retention cleanup function", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION purge_operational_events");
    expect(migration).toContain("occurred_at < now() - interval '180 days'");
    expect(migration).toContain("occurred_at < now() - interval '30 days'");
    expect(migration).toContain("REVOKE ALL ON FUNCTION purge_operational_events() FROM PUBLIC, anon, authenticated");
  });
});

describe("Supabase Edge Functions", () => {
  it("sends only published current-week digest articles and reserves one log row first", () => {
    expect(weeklyDigestFunction).toContain(".eq(\"is_published\", true)");
    expect(weeklyDigestFunction).toContain(".gte(\"published_at\", publishedSince)");
    expect(weeklyDigestFunction).toContain(".from(\"digest_send_log\")");
    expect(weeklyDigestFunction).toContain("status: \"skipped\"");
    expect(weeklyDigestFunction).toContain("reservationError.code === \"23505\"");
    expect(weeklyDigestFunction).toContain("authorization");
  });

  it("requires exact account deletion confirmation and protects the sole admin", () => {
    expect(deleteAccountFunction).toContain("confirmation !== `DELETE ${user.email}`");
    expect(deleteAccountFunction).toContain("Assign another administrator before deleting the only administrator account");
    expect(deleteAccountFunction).toContain("auth.admin.deleteUser");
    expect(deleteAccountFunction).toContain(".from(\"profiles\")");
  });
});
