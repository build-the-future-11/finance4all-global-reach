import { supabase } from "@/lib/supabase";

export async function checkServerRateLimit(
  action: string,
  identifier: string,
  maxAttempts: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_action: action,
    p_identifier: identifier,
    p_max_attempts: maxAttempts,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    if (error.code === "42883" || error.message?.includes("does not exist")) return true;
    console.error("Rate limit check failed:", error.message);
    return true;
  }
  return Boolean(data);
}

export async function recordServerRateLimit(action: string, identifier: string): Promise<void> {
  const { error } = await supabase.rpc("record_rate_limit", {
    p_action: action,
    p_identifier: identifier,
  });
  if (error && error.code !== "42883") {
    console.error("Rate limit record failed:", error.message);
  }
}
