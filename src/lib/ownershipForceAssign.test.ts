import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migrationsDir = join(root, "supabase/migrations");
const migration018 = readFileSync(
  join(migrationsDir, "018_security_definer_search_path.sql"),
  "utf8",
);
const migration019 = readFileSync(
  join(migrationsDir, "019_ownership_force_assign.sql"),
  "utf8",
);
const verifySetup = readFileSync(join(root, "supabase/VERIFY_SETUP.sql"), "utf8");

describe("SECURITY DEFINER search_path harden", () => {
  it("pins every public SECURITY DEFINER function to public, pg_temp", () => {
    expect(migration018).toContain("p.prosecdef");
    expect(migration018).toContain("SET search_path = public, pg_temp");
  });

  it("is asserted by VERIFY_SETUP", () => {
    expect(verifySetup).toContain("security_definer_search_path_check");
    expect(verifySetup).toContain("search_path=public, pg_temp");
  });
});

describe("ownership force-assign", () => {
  it("overwrites ownership columns from auth.uid() on insert", () => {
    expect(migration019).toContain("NEW.user_id := (SELECT auth.uid())");
    expect(migration019).toContain("NEW.applicant_id := (SELECT auth.uid())");
    expect(migration019).toContain("NEW.from_user_id := (SELECT auth.uid())");
    expect(migration019).toContain("force_news_bookmark_owner");
    expect(migration019).toContain("force_opportunity_interest_owner");
    expect(migration019).toContain("force_education_progress_owner");
  });

  it("deep-links lab application received notifications to the review filter", () => {
    expect(migration019).toContain("'/portal/labs/review?project=' || NEW.project_id::TEXT");
  });

  it("indexes common ownership queries", () => {
    expect(migration019).toContain("opportunity_interests_user");
    expect(migration019).toContain("lab_applications_applicant");
    expect(migration019).toContain("event_registrations_user");
  });
});

describe("notification ownership and moderation", () => {
  const migration020 = readFileSync(
    join(migrationsDir, "020_notification_ownership_moderation.sql"),
    "utf8",
  );

  it("freezes notification content updates to the read flag", () => {
    expect(migration020).toContain("protect_notification_content");
    expect(migration020).toContain("Only the read flag can be updated on notifications");
  });

  it("force-assigns research lead and competition created_by", () => {
    expect(migration020).toContain("NEW.lead_researcher_id := (SELECT auth.uid())");
    expect(migration020).toContain("NEW.created_by := (SELECT auth.uid())");
  });

  it("notifies authors on studio and essay moderation", () => {
    expect(migration020).toContain("studio_submission_status");
    expect(migration020).toContain("essay_submission_status");
    expect(migration020).toContain("'/portal/pathways/studios'");
    expect(migration020).toContain("'/portal/pathways/essays'");
  });
});

describe("FINAL_SETUP synchronization", () => {
  it("includes migrations 018 through 020", () => {
    const finalSetup = readFileSync(join(root, "supabase/FINAL_SETUP.sql"), "utf8");
    const migrationFiles = readdirSync(migrationsDir)
      .filter((name) => /^\d{3}_.+\.sql$/.test(name))
      .sort();

    expect(migrationFiles).toContain("018_security_definer_search_path.sql");
    expect(migrationFiles).toContain("019_ownership_force_assign.sql");
    expect(migrationFiles).toContain("020_notification_ownership_moderation.sql");
    expect(finalSetup).toContain("-- 018_security_definer_search_path.sql");
    expect(finalSetup).toContain("-- 019_ownership_force_assign.sql");
    expect(finalSetup).toContain("-- 020_notification_ownership_moderation.sql");
    expect(finalSetup).toContain("SET search_path = public, pg_temp");
    expect(finalSetup).toContain("force_news_bookmark_owner");
    expect(finalSetup).toContain("protect_notification_content_write");
  });
});
