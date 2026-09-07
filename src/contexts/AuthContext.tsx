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
import { mapProfile, PUBLIC_PROFILE_COLUMNS } from "@/lib/mappers";
import { rememberPostAuthPath } from "@/lib/auth-navigation";
import { withDeadline } from "@/lib/asyncDeadline";
import type { UserProfile } from "@/types/domain";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{
    error: string | null;
    emailConfirmationRequired: boolean;
  }>;
  signInWithGoogle: (returnTo?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, "displayName" | "bio" | "interests" | "openToCollaborate" | "chapterId">>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_OPERATION_TIMEOUT_MS = 15_000;

function googleDisplayName(user: User) {
  const meta = user.user_metadata ?? {};
  return (
    (meta.display_name as string) ||
    (meta.full_name as string) ||
    (meta.name as string) ||
    ""
  );
}

function googleAvatarUrl(user: User) {
  const meta = user.user_metadata ?? {};
  return (meta.avatar_url as string) || (meta.picture as string) || undefined;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = useCallback(async (user: User) => {
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select(PUBLIC_PROFILE_COLUMNS)
      .eq("id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error("Profile lookup failed:", existingError.message);
      return null;
    }

    if (existing) return mapProfile(existing);

    const displayName = googleDisplayName(user);
    const avatarUrl = googleAvatarUrl(user);

    const { data: created, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email ?? "",
        display_name: displayName,
        avatar_url: avatarUrl ?? null,
      })
      .select(PUBLIC_PROFILE_COLUMNS)
      .single();

    if (error) {
      // Initial session hydration and the auth-state listener can legitimately
      // race on a brand-new account. Recover only the database's duplicate-key
      // signal by re-reading the canonical row; every other insert failure stays
      // fail-closed rather than being treated as a successful profile creation.
      if (error.code === "23505") {
        const { data: concurrentExisting, error: concurrentReadError } = await supabase
          .from("profiles")
          .select(PUBLIC_PROFILE_COLUMNS)
          .eq("id", user.id)
          .maybeSingle();

        if (concurrentReadError) {
          console.error("Profile race recovery failed:", concurrentReadError.message);
          return null;
        }
        if (concurrentExisting) return mapProfile(concurrentExisting);
      }

      console.error("Profile ensure failed:", error.message);
      return null;
    }

    return mapProfile(created);
  }, []);

  const fetchProfile = useCallback(
    async (user: User) => {
      const { data, error } = await supabase
        .from("profiles")
        .select(PUBLIC_PROFILE_COLUMNS)
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

      const mapped = mapProfile(data);

      // Sync Google avatar if profile is missing one
      const avatarUrl = googleAvatarUrl(user);
      if (!mapped.avatarUrl && avatarUrl) {
        await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
        mapped.avatarUrl = avatarUrl;
      }

      setProfile(mapped);
    },
    [ensureProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchProfile(session.user);
  }, [session?.user, fetchProfile]);

  useEffect(() => {
    void withDeadline(
      () => supabase.auth.getSession(),
      AUTH_OPERATION_TIMEOUT_MS,
      "Initial auth session fetch",
    )
      .then(async ({ data, error }) => {
        if (error) throw error;
        setSession(data.session);
        if (data.session?.user) await fetchProfile(data.session.user);
      })
      .catch((error: unknown) => {
        console.error("Session initialization failed", error);
        setSession(null);
        setProfile(null);
      })
      .finally(() => setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        setLoading(true);
        void fetchProfile(nextSession.user).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await withDeadline(
        () => supabase.auth.signInWithPassword({ email, password }),
        AUTH_OPERATION_TIMEOUT_MS,
        "Sign in",
      );
      return { error: error?.message ?? null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Sign in failed. Please try again.",
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await withDeadline(
        () =>
          supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: getAuthRedirectUrl(),
              data: { display_name: displayName },
            },
          }),
        AUTH_OPERATION_TIMEOUT_MS,
        "Sign up",
      );
      return {
        error: error?.message ?? null,
        emailConfirmationRequired: Boolean(data.user && !data.session),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Sign up failed. Please try again.",
        emailConfirmationRequired: false,
      };
    }
  }, []);

  const signInWithGoogle = useCallback(async (returnTo?: string) => {
    rememberPostAuthPath(returnTo);
    try {
      const { error } = await withDeadline(
        () =>
          supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: getAuthRedirectUrl(),
              queryParams: { prompt: "select_account" },
            },
          }),
        AUTH_OPERATION_TIMEOUT_MS,
        "Google sign in",
      );
      return { error: error?.message ?? null };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Google sign in failed. Please try again.",
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await withDeadline(
        () => supabase.auth.signOut(),
        AUTH_OPERATION_TIMEOUT_MS,
        "Sign out",
      );
      if (error) {
        console.error("Sign out failed:", error.message);
        return;
      }
      setProfile(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, []);

  const updateProfile = useCallback(
    async (
      updates: Partial<Pick<UserProfile, "displayName" | "bio" | "interests" | "openToCollaborate" | "chapterId">>,
    ) => {
      if (!session?.user) return { error: "Not authenticated" };

      const payload: Record<string, unknown> = {};
      if (updates.displayName !== undefined) payload.display_name = updates.displayName;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.interests !== undefined) payload.interests = updates.interests;
      if (updates.openToCollaborate !== undefined) payload.open_to_collaborate = updates.openToCollaborate;
      if (updates.chapterId !== undefined) payload.chapter_id = updates.chapterId ?? null;

      try {
        const { error } = await withDeadline(
          () => supabase.from("profiles").update(payload).eq("id", session.user.id),
          AUTH_OPERATION_TIMEOUT_MS,
          "Profile update",
        );
        if (!error) await fetchProfile(session.user);
        return { error: error?.message ?? null };
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Profile update failed. Please try again.",
        };
      }
    },
    [session?.user, fetchProfile],
  );

  const needsOnboarding = Boolean(profile && !profile.displayName?.trim());

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      needsOnboarding,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [session, profile, loading, needsOnboarding, signIn, signUp, signInWithGoogle, signOut, refreshProfile, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
