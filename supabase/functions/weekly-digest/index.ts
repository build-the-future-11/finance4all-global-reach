import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function startOfUtcWeek(now = new Date()): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const cronSecret = requiredEnv("DIGEST_CRON_SECRET");
    const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    const explicitToken = request.headers.get("x-digest-cron-secret")?.trim();
    if (bearerToken !== cronSecret && explicitToken !== cronSecret) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = requiredEnv("RESEND_API_KEY");
    const fromEmail = requiredEnv("DIGEST_FROM_EMAIL");
    const siteUrl = new URL(requiredEnv("SITE_URL"));
    if (siteUrl.protocol !== "https:") throw new Error("SITE_URL must use HTTPS");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
      throw new Error("DIGEST_FROM_EMAIL must be a valid email address");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const periodStart = startOfUtcWeek();
    const publishedSince = new Date(`${periodStart}T00:00:00.000Z`).toISOString();

    const [{ data: preferences, error: preferencesError }, { data: articles, error: articlesError }] =
      await Promise.all([
        supabase
          .from("digest_preferences")
          .select("user_id, preferred_categories, profiles(email, display_name)")
          .eq("weekly_digest_enabled", true),
        supabase
          .from("news_articles")
          .select("title, summary, category, published_at")
          .eq("is_published", true)
          .eq("newsletter_include", true)
          .in("status", ["published", "corrected"])
          .gte("published_at", publishedSince)
          .order("published_at", { ascending: false })
          .limit(20),
      ]);

    if (preferencesError) throw preferencesError;
    if (articlesError) throw articlesError;
    if (!articles?.length) {
      return json({ sent: 0, failed: 0, skipped: preferences?.length ?? 0, reason: "no_new_articles" });
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const preference of preferences ?? []) {
      const profile = preference.profiles as { email: string; display_name: string } | null;
      const categories = preference.preferred_categories as string[] | null;
      const picks = articles
        .filter((article) => !categories?.length || categories.includes(article.category))
        .slice(0, 5);

      if (!profile?.email || !picks.length) {
        skipped += 1;
        continue;
      }

      // Reserving the user/week row before calling Resend prevents duplicate delivery
      // when cron invocations overlap or are retried.
      const { data: reservation, error: reservationError } = await supabase
        .from("digest_send_log")
        .insert({
          user_id: preference.user_id,
          period_start: periodStart,
          status: "skipped",
          article_count: picks.length,
        })
        .select("id")
        .single();

      if (reservationError) {
        if (reservationError.code === "23505") {
          skipped += 1;
          continue;
        }
        throw reservationError;
      }

      const displayName = escapeHtml(profile.display_name || "there");
      const digestUrl = new URL("/portal/debriefed", siteUrl).toString();
      const html = `
        <main style="font-family:Arial,sans-serif;line-height:1.55;color:#17202a;max-width:640px;margin:auto">
          <h1 style="font-size:24px">Your Finance4All weekly digest</h1>
          <p>Hi ${displayName},</p>
          <p>Here are this week's published Finance Debrief updates.</p>
          ${picks.map((article) => `
            <article style="border-top:1px solid #d9dee3;padding:16px 0">
              <h2 style="font-size:18px;margin:0 0 6px">${escapeHtml(article.title)}</h2>
              <p style="margin:0">${escapeHtml(article.summary)}</p>
            </article>
          `).join("")}
          <p><a href="${escapeHtml(digestUrl)}">Read the full Finance Debrief</a></p>
          <p style="font-size:13px;color:#5f6b76">You can change weekly digest preferences in your member settings.</p>
        </main>`;

      let status: "sent" | "failed" = "failed";
      let errorMessage: string | null = null;
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: profile.email,
            subject: "Finance4All weekly digest",
            html,
          }),
        });
        if (!response.ok) {
          errorMessage = (await response.text()).slice(0, 500);
        } else {
          status = "sent";
        }
      } catch (error) {
        errorMessage = error instanceof Error ? error.message.slice(0, 500) : "Email provider request failed";
      }

      const { error: logError } = await supabase
        .from("digest_send_log")
        .update({ status, error_message: errorMessage, sent_at: new Date().toISOString() })
        .eq("id", reservation.id);
      if (logError) throw logError;

      if (status === "sent") {
        sent += 1;
        const { error: preferenceError } = await supabase
          .from("digest_preferences")
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq("user_id", preference.user_id);
        if (preferenceError) throw preferenceError;
      } else {
        failed += 1;
      }
    }

    return json({ sent, failed, skipped, subscribers: preferences?.length ?? 0, periodStart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Digest execution failed";
    console.error("weekly-digest", message);
    return json({ error: "Digest execution failed" }, 500);
  }
});
