import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-digest-cron-secret",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("DIGEST_CRON_SECRET");
  if (!cronSecret) {
    return new Response(JSON.stringify({ error: "Digest cron not configured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.headers.get("x-digest-cron-secret") !== cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("DIGEST_FROM_EMAIL") ?? "digest@finance4all.org";
    const siteUrl = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");

    const { data: prefs, error: prefsErr } = await supabase
      .from("digest_preferences")
      .select("user_id, preferred_categories, profiles(email, display_name)")
      .eq("weekly_digest_enabled", true);

    if (prefsErr) throw prefsErr;

    const { data: articles, error: newsErr } = await supabase
      .from("news_articles")
      .select("title, summary, category, published_at")
      .order("published_at", { ascending: false })
      .limit(20);

    if (newsErr) throw newsErr;

    let sent = 0;
    let failed = 0;

    for (const pref of prefs ?? []) {
      const profile = pref.profiles as { email: string; display_name: string } | null;
      if (!profile?.email) continue;

      const cats = pref.preferred_categories as string[] | null;
      const picks = (articles ?? []).filter(
        (a) => !cats?.length || cats.includes(a.category),
      ).slice(0, 5);

      if (!picks.length) continue;

      const displayName = escapeHtml(profile.display_name || "there");
      const html = `
        <h2>Your Finance4All weekly digest</h2>
        <p>Hi ${displayName},</p>
        <ul>
          ${picks
            .map(
              (a) =>
                `<li><strong>${escapeHtml(a.title)}</strong><br/>${escapeHtml(a.summary)}</li>`,
            )
            .join("")}
        </ul>
        <p><a href="${escapeHtml(`${siteUrl}/portal/debriefed`)}">Read more on Debriefed →</a></p>
      `;

      let status = "skipped";
      let errorMessage: string | null = null;

      if (resendKey) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: profile.email,
            subject: "Your Finance4All weekly digest",
            html,
          }),
        });
        if (res.ok) {
          status = "sent";
          sent++;
        } else {
          status = "failed";
          errorMessage = await res.text();
          failed++;
        }
      } else {
        status = "skipped";
      }

      await supabase.from("digest_send_log").insert({
        user_id: pref.user_id,
        status,
        article_count: picks.length,
        error_message: errorMessage,
      });

      if (status === "sent") {
        await supabase
          .from("digest_preferences")
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq("user_id", pref.user_id);
      }
    }

    return new Response(JSON.stringify({ sent, failed, subscribers: prefs?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
