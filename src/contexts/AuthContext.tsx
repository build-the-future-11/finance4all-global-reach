import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getAuthRedirectUrl, supabase } from "@/lib/supabase";
import { getAuthCallbackUrl, getResetPasswordUrl } from "@/lib/appOrigin";
import { formatAuthError, sanitizeUserFacingError } from "@/lib/authErrors";
import {
  isPasswordAcceptable,
  isValidEmail,
  sanitizeBio,
  sanitizeDisplayName,
  sanitizeInterests,
  checkLoginRateLimit,
  recordLoginAttempt,
  clearLoginAttempts,
} from "@/lib/security";
import { mapProfile } from "@/lib/mappers";
import type { UserProfile } from "@/types/domain";
import { trackEvent } from "@/lib/analytics";
import { checkServerRateLimit, recordServerRateLimit } from "@/lib/rateLimit";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (updates: {
    displayName: string;
    bio?: string;
    interests?: string[];
    openToCollaborate?: boolean;
    chapterId?: string;
  }) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Pick<UserProfile, "displayName" | "bio" | "interests" | "openToCollaborate" | "chapterId">>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(false);

  const ensureProfile = useCallback(async (user: User) => {
    const { error: ensureError } = await supabase.rpc("ensure_my_profile");

    if (ensureError) {
      console.error("Profile ensure failed:", ensureError.message);
      return null;
    }

    const { data: existing, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch after ensure failed:", error.message);
      return null;
    }

    if (existing) return mapProfile(existing);
    return null;
  }, []);

  const fetchProfile = useCallback(
    async (user: User) => {
      setProfileReady(false);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Profile fetch failed:", error.message);
          setProfile(null);
          return;
        }

        if (!data) {
          const ensured = await ensureProfile(user);
          setProfile(ensured);
          return;
        }

        setProfile(mapProfile(data));
      } finally {
        setProfileReady(true);
      }
    },
    [ensureProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchProfile(session.user);
  }, [session?.user, fetchProfile]);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      if (data.session?.user) {
        await fetchProfile(data.session.user);
      } else {
        setProfile(null);
        setProfileReady(true);
      }
      if (!cancelled) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void fetchProfile(nextSession.user).finally(() => {
          if (!cancelled) setLoading(false);
        });
      } else {
        setProfile(null);
        setProfileReady(true);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isValidEmail(email)) return { error: "Enter a valid email address." };
    const limit = checkLoginRateLimit(email);
    if (!limit.allowed) {
      const wait = limit.retryAfterSec ?? 300;
      const minutes = Math.ceil(wait / 60);
      return { error: `Too many sign-in attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.` };
    }
    const serverAllowed = await checkServerRateLimit("login", email, 8, 900);
    if (!serverAllowed) {
      return { error: "Too many sign-in attempts. Try again in about 15 minutes." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      recordLoginAttempt(email);
      await recordServerRateLimit("login", email);
      return { error: formatAuthError(error.message) };
    }
    clearLoginAttempts(email);
    trackEvent("auth.sign_in", { method: "email" });
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const name = sanitizeDisplayName(displayName);
    if (!name) return { error: "Display name is required." };
    if (!isValidEmail(email)) return { error: "Enter a valid email address." };
    if (!isPasswordAcceptable(password)) {
      return { error: "Password must be at least 8 characters with letters and numbers." };
    }
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });
    if (!error) trackEvent("auth.sign_up", { method: "email" });
    return { error: error ? formatAuthError(error.message) : null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthRedirectUrl(),
        queryParams: { prompt: "select_account" },
      },
    });
    if (!error) trackEvent("auth.sign_in", { method: "google" });
    return { error: error ? formatAuthError(error.message) : null };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isValidEmail(email)) return { error: "Enter a valid email address." };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getResetPasswordUrl(),
    });
    return { error: error ? formatAuthError(error.message) : null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!isPasswordAcceptable(password)) {
      return { error: "Password must be at least 8 characters with letters and numbers." };
    }
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? formatAuthError(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    trackEvent("auth.sign_out");
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const updateProfile = useCallback(
    async (
      updates: Partial<Pick<UserProfile, "displayName" | "bio" | "interests" | "openToCollaborate" | "chapterId">>,
    ) => {
      if (!session?.user || !profile) return { error: "Profile is not available yet." };

      const displayName = sanitizeDisplayName(updates.displayName ?? profile.displayName);
      if (!displayName) return { error: "Display name is required." };

      const { error } = await supabase.rpc("update_my_profile", {
        p_display_name: displayName,
        p_bio: updates.bio !== undefined ? sanitizeBio(updates.bio) || null : profile.bio ?? null,
        p_interests: updates.interests !== undefined ? sanitizeInterests(updates.interests) : profile.interests,
        p_open_to_collaborate: updates.openToCollaborate ?? profile.openToCollaborate,
        p_chapter_id: updates.chapterId !== undefined ? updates.chapterId ?? null : profile.chapterId ?? null,
      });
      if (!error) await fetchProfile(session.user);
      return { error: error ? sanitizeUserFacingError(error.message) : null };
    },
    [session?.user, profile, fetchProfile],
  );

  const completeOnboarding = useCallback(
    async ({
      displayName,
      bio,
      interests,
      openToCollaborate,
      chapterId,
    }: {
      displayName: string;
      bio?: string;
      interests?: string[];
      openToCollaborate?: boolean;
      chapterId?: string;
    }) => {
      if (!session?.user) return { error: "Not authenticated" };

      const name = sanitizeDisplayName(displayName);
      if (!name) return { error: "Display name is required." };

      const { error } = await supabase.rpc("complete_profile_onboarding", {
        p_display_name: name,
        p_bio: sanitizeBio(bio),
        p_interests: sanitizeInterests(interests),
        p_open_to_collaborate: openToCollaborate ?? false,
        p_chapter_id: chapterId ?? null,
      });

      if (!error) {
        await fetchProfile(session.user);
        trackEvent("auth.onboarding_completed");
      }

      return { error: error ? sanitizeUserFacingError(error.message) : null };
    },
    [session?.user, fetchProfile],
  );

  // Keep auth loading until the profile fetch settles for an authenticated user.
  const authLoading = loading || Boolean(session?.user && !profileReady);
  const needsOnboarding = Boolean(profile && !profile.onboardingCompletedAt);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading: authLoading,
      needsOnboarding,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      updatePassword,
      signOut,
      refreshProfile,
      completeOnboarding,
      updateProfile,
    }),
    [session, profile, authLoading, needsOnboarding, signIn, signUp, signInWithGoogle, resetPassword, updatePassword, signOut, refreshProfile, completeOnboarding, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
