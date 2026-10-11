import type { Page } from "@playwright/test";

export async function installMemberFixture(page: Page, role: "member" | "admin" = "member") {
  const id = "91000000-0000-4000-8000-000000000001";
  const timestamp = "2026-10-11T00:00:00Z";
  const user = { id, aud: "authenticated", role: "authenticated", email: "qa@example.test", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: { onboarding_version: 1, school: "QA fixture", age_band: "18–20" }, created_at: timestamp };
  await page.addInitScript(user => {
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const token = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })) + "." + btoa(JSON.stringify({ sub: user.id, role: "authenticated", exp: expires })) + ".test-signature";
    localStorage.setItem("sb-pnemeegkwyaicsbnbnmg-auth-token", JSON.stringify({ access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, expires_at: expires, user }));
  }, user);
  await page.route("https://pnemeegkwyaicsbnbnmg.supabase.co/**", route => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = [];
    if (path.endsWith("/user")) body = user;
    if (path.endsWith("/profiles")) body = { id, display_name: "QA Reviewer", role, bio: "Browser rendering fixture only", avatar_url: null, interests: [], open_to_collaborate: false, chapter_id: null, created_at: timestamp, updated_at: timestamp };
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
}
