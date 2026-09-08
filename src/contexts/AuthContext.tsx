import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getAuthRedirectUrl, supabase } from "@/lib/supabase";
import { mapProfile, PUBLIC_PROFILE_COLUMNS } from "@/lib/mappers";
import { rememberPostAuthPath } from "@/lib/auth-navigation";
import { withDeadline } from "@/lib/asyncDeadline";
import type { UserProfile } from "@/types/domain";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/contexts/auth-context";
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
  const queryClient = useQueryClient();
  const activeUser = useRef<string | null>(null);
  const authGeneration = useRef(0);
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
      const generation = authGeneration.current;
      const applyProfile = (value: UserProfile | null) => {
        if (authGeneration.current === generation && activeUser.current === user.id) setProfile(value);
      };
      const { data, error } = await supabase
        .from("profiles")
        .select(PUBLIC_PROFILE_COLUMNS)
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile fetch failed:", error.message);
        applyProfile(null);
        return;
      }

      if (!data) {
        const ensured = await ensureProfile(user);
        applyProfile(ensured);
        return;
      }

      const mapped = mapProfile(data);

      // Sync Google avatar if profile is missing one
      const avatarUrl = googleAvatarUrl(user);
      if (!mapped.avatarUrl && avatarUrl) {
        const { data: saved, error: saveError } = await supabase.from("profiles")
          .update({ avatar_url: avatarUrl }).eq("id", user.id)
          .select("id, avatar_url").single();
        if (!saveError && saved?.id === user.id && saved.avatar_url === avatarUrl) {
          mapped.avatarUrl = avatarUrl;
        } else {
          // Optional synchronization must not discard a valid profile or imply persistence.
          console.warn("Profile avatar synchronization was not confirmed.");
        }
      }

      applyProfile(mapped);
    },
    [ensureProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchProfile(session.user);
  }, [session?.user, fetchProfile]);

  useEffect(() => {
    let disposed = false;
    let receivedAuthEvent = false;
    const applySession = (nextSession: Session | null) => {
      const nextUser = nextSession?.user.id ?? null;
      if (activeUser.current !== nextUser) {
        authGeneration.current += 1;
        activeUser.current = nextUser;
        queryClient.clear();
        setProfile(null);
      }
      setSession(nextSession);
    };
    void withDeadline(
      () => supabase.auth.getSession(),
      AUTH_OPERATION_TIMEOUT_MS,
      "Initial auth session fetch",
    )
      .then(async ({ data, error }) => {
        if (error) throw error;
        if (disposed || receivedAuthEvent) return;
        applySession(data.session);
        if (data.session?.user) await withDeadline(() => fetchProfile(data.session!.user), AUTH_OPERATION_TIMEOUT_MS, "Profile initialization");
      })
      .catch((error: unknown) => {
        if (disposed || receivedAuthEvent) return;
        console.error("Session initialization failed", error);
        applySession(null);
      })
      .finally(() => { if (!disposed && !receivedAuthEvent) setLoading(false); });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      applySession(nextSession);
      const generation = authGeneration.current;
      if (nextSession?.user) {
        setLoading(true);
        void withDeadline(() => fetchProfile(nextSession.user), AUTH_OPERATION_TIMEOUT_MS, "Profile refresh").catch(() => {
          if (!disposed && authGeneration.current === generation) {
            authGeneration.current += 1;
            setProfile(null);
          }
        }).finally(() => {
          if (!disposed && activeUser.current === nextSession.user.id) setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => { disposed = true; authGeneration.current += 1; sub.subscription.unsubscribe(); };
  }, [fetchProfile, queryClient]);

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
