import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mapMemberDirectoryProfile } from "@/lib/mappers";

const directoryRow = {
  id: "00000000-0000-4000-8000-000000000001",
  display_name: "Directory Member",
  role: "member" as const,
  bio: "Interested in macroeconomics.",
  avatar_url: null,
  interests: ["macro"],
  open_to_collaborate: true,
  chapter_id: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("member directory privacy", () => {
  it("maps only the fields intended for authenticated members", () => {
    expect(mapMemberDirectoryProfile(directoryRow)).toEqual({
      id: directoryRow.id,
      displayName: directoryRow.display_name,
      role: "member",
      bio: directoryRow.bio,
      interests: ["macro"],
      openToCollaborate: true,
      createdAt: directoryRow.created_at,
      updatedAt: directoryRow.updated_at,
    });
  });

  it("uses a fixed-column view and no longer grants members direct directory reads", () => {
    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/010_directory_privacy.sql"),
      "utf8",
    );
    const viewDefinition = migration.split("CREATE OR REPLACE VIEW member_directory")[1].split("REVOKE ALL")[0];

    expect(migration).toContain('CREATE POLICY "Users view own profile"');
    expect(migration).toContain("USING (auth.uid() = id)");
    expect(viewDefinition).not.toMatch(/\bemail\b/i);
    expect(viewDefinition).toContain("onboarding_completed_at IS NOT NULL");
    expect(migration).toContain("GRANT SELECT ON TABLE member_directory TO authenticated");
  });
});
