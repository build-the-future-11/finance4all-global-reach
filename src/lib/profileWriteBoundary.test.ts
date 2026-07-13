import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readWorkspaceFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("profile write boundary", () => {
  it("removes direct member profile writes and grants only authenticated RPC access", () => {
    const migration = readWorkspaceFile("supabase/migrations/011_profile_write_boundary.sql");

    expect(migration).toContain('DROP POLICY IF EXISTS "Users can update own profile" ON profiles');
    expect(migration).toContain("CREATE OR REPLACE FUNCTION update_my_profile(");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION set_my_avatar(");
    expect(migration).toContain("REVOKE ALL ON FUNCTION update_my_profile");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION update_my_profile");
    expect(migration).toContain("FROM storage.objects");
  });

  it("uses the constrained RPCs instead of direct member profile updates", () => {
    const authContext = readWorkspaceFile("src/contexts/AuthContext.tsx");
    const avatarUpload = readWorkspaceFile("src/hooks/portal/useAvatarUpload.ts");

    expect(authContext).toContain('supabase.rpc("update_my_profile"');
    expect(authContext).not.toContain('from("profiles").update(payload)');
    expect(avatarUpload).toContain('supabase.rpc("set_my_avatar"');
    expect(avatarUpload).not.toContain('from("profiles")\n        .update({ avatar_url: avatarUrl })');
  });
});
