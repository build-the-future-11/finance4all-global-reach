import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const allowedHeaders = "authorization, x-client-info, apikey, content-type";

function corsHeaders(origin: string | null, siteOrigin: string): Record<string, string> {
  const developmentOrigins = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
  const allowedOrigin = origin === siteOrigin || (origin ? developmentOrigins.has(origin) : false)
    ? origin
    : siteOrigin;
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": allowedHeaders,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (request) => {
  let siteOrigin: string;
  try {
    siteOrigin = new URL(Deno.env.get("SITE_URL") ?? "").origin;
  } catch {
    return new Response(JSON.stringify({ error: "Account service is not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin, siteOrigin);
  const allowedOrigins = new Set([siteOrigin, "http://localhost:5173", "http://127.0.0.1:5173"]);
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origin not allowed" }, 403, headers);
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Account service is not configured" }, 503, headers);
  }
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401, headers);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user?.email) return json({ error: "Authentication required" }, 401, headers);

  let confirmation = "";
  try {
    const body = await request.json() as { confirmation?: unknown };
    confirmation = typeof body.confirmation === "string" ? body.confirmation : "";
  } catch {
    return json({ error: "Invalid request" }, 400, headers);
  }
  if (confirmation !== `DELETE ${user.email}`) {
    return json({ error: "Confirmation did not match" }, 400, headers);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profileError) return json({ error: "Could not verify the account" }, 500, headers);

  if (profile.role === "admin") {
    const { count, error: countError } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) return json({ error: "Could not verify administrator coverage" }, 500, headers);
    if ((count ?? 0) <= 1) {
      return json({ error: "Assign another administrator before deleting the only administrator account" }, 409, headers);
    }
  }

  const { data: avatarObjects, error: listError } = await admin.storage.from("avatars").list(user.id, { limit: 100 });
  if (listError) return json({ error: "Could not remove account files" }, 500, headers);
  const objectPaths = (avatarObjects ?? []).map((object) => `${user.id}/${object.name}`);
  if (objectPaths.length) {
    const { error: removeError } = await admin.storage.from("avatars").remove(objectPaths);
    if (removeError) return json({ error: "Could not remove account files" }, 500, headers);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("delete-account", deleteError.message);
    return json({ error: "Could not delete the account" }, 500, headers);
  }

  return json({ deleted: true }, 200, headers);
});
