import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getAuthRedirectUrl, supabase } from "@/lib/supabase";
import { createAuthHydrationGuard } from "@/lib/authHydrationGuard";
import { withDeadline } from "@/lib/asyncDeadline";
import { mapProfile } from "@/lib/mappers";
import type { UserProfile } from "@/types/domain";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, "displayName" | "bio" | "interests" | "openToCollaborate" | "chapterId">>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PROFILE_HYDRATION_TIMEOUT_MS = 15_000;
const AUTH_SESSION_OPERATION_TIMEOUT_MS = 15_000;

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
  const hydrationGuard = useRef(createAuthHydrationGuard());
  const activeUserIdRef = useRef<string | null>(null);

  const ensureProfile = useCallback(async (user: User) => {
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("*")
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
      .select("*")
      .single();

    if (error) {
      // Two legitimate auth hydration paths can race on a brand-new account
      // (for example getSession() and INITIAL_SESSION). If the other path won
      // the insert, recover only from the database's unique-violation signal by
      // re-reading the canonical row. All other insert failures remain fail-closed.
      if (error.code === "23505") {
        const { data: concurrentExisting, error: concurrentReadError } = await supabase
          .from("profiles")
          .select("*")
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
    async (user: User): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile fetch failed:", error.message);
        return null;
      }

      if (!data) return ensureProfile(user);

      const mapped = mapProfile(data);

      // Sync Google avatar if profile is missing one, but only reflect the
      // change locally after persistence succeeds so UI state never claims a
      // value that the canonical profile row rejected.
      const avatarUrl = googleAvatarUrl(user);
      if (!mapped.avatarUrl && avatarUrl) {
        const { error: avatarError } = await supabase
          .from("profiles")
          .update({ avatar_url: avatarUrl })
          .eq("id", user.id);
        if (avatarError) {
          console.error("Profile avatar sync failed:", avatarError.message);
        } else {
          mapped.avatarUrl = avatarUrl;
        }
      }

      return mapped;
    },
    [ensureProfile],
  );

  const refreshProfile = useCallback(async () => {
    const user = session?.user;
    if (!user) return;

    const token = hydrationGuard.current.snapshot();
    const refreshed = await fetchProfile(user);
    if (
      hydrationGuard.current.isCurrent(token) &&
      activeUserIdRef.current === user.id
    ) {
      setProfile(refreshed);
    }
  }, [session?.user, fetchProfile]);

  useEffect(() => {
    const guard = hydrationGuard.current;
    let disposed = false;

    const hydrateSession = async (nextSession: Session | null, token: number) => {
      if (disposed || !guard.isCurrent(token)) return;

      activeUserIdRef.current = nextSession?.user.id ?? null;
      setSession(nextSession);
      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Never expose the previous user's profile while the next authenticated
      // identity is still hydrating.
      setProfile(null);
      setLoading(true);

      let nextProfile: UserProfile | null;
      try {
        nextProfile = await withDeadline(
          () => fetchProfile(nextSession.user),
          PROFILE_HYDRATION_TIMEOUT_MS,
          "Profile hydration",
        );
      } catch (error) {
        if (
          disposed ||
          !guard.isCurrent(token) ||
          activeUserIdRef.current !== nextSession.user.id
        ) {
          return;
        }
        console.error("Profile hydration failed:", error);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (
        disposed ||
        !guard.isCurrent(token) ||
        activeUserIdRef.current !== nextSession.user.id
      ) {
        return;
      }
      setProfile(nextProfile);
      setLoading(false);
    };

    // getSession() and onAuthStateChange(INITIAL_SESSION) may race. The first
    // listener event supersedes this initial probe so a late getSession result
    // cannot overwrite a newer sign-in/sign-out transition. Bound the initial
    // probe as well: a stalled auth client must not leave the app permanently
    // behind the global loading gate before any listener event arrives.
    const initialToken = guard.begin();
    void withDeadline(
      () => supabase.auth.getSession(),
      AUTH_SESSION_OPERATION_TIMEOUT_MS,
      "Initial auth session fetch",
    )
      .then(({ data }) => {
        void hydrateSession(data.session, initialToken);
      })
      .catch((error: unknown) => {
        if (disposed || !guard.isCurrent(initialToken)) return;
        console.error("Initial auth session fetch failed:", error);
        activeUserIdRef.current = null;
        setSession(null);
        setProfile(null);
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const token = guard.begin();
      void hydrateSession(nextSession, token);
    });

    return () => {
      disposed = true;
      activeUserIdRef.current = null;
      guard.invalidate();
      sub.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthRedirectUrl(),
        queryParams: { prompt: "select_account" },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const guard = hydrationGuard.current;
    const token = guard.begin();
    setLoading(true);

    try {
      // A stalled remote sign-out must not strand the product in loading=true
      // forever. Timeout is fail-closed: local auth state stays intact unless
      // Supabase actually reports a successful sign-out or a newer auth event
      // has already superseded this request.
      const { error } = await withDeadline(
        () => supabase.auth.signOut(),
        AUTH_SESSION_OPERATION_TIMEOUT_MS,
        "Sign out",
      );
      if (error) {
        console.error("Sign out failed:", error.message);
        if (guard.isCurrent(token)) setLoading(false);
        return;
      }

      // onAuthStateChange(SIGNED_OUT) normally owns this transition. If it did
      // not fire, clear local auth state only when no newer auth event has
      // superseded this sign-out request.
      if (guard.isCurrent(token)) {
        activeUserIdRef.current = null;
        setSession(null);
        setProfile(null);
        setLoading(false);
      }
    } catch (error) {
      console.error("Sign out failed:", error);
      if (guard.isCurrent(token)) setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (
      updates: Partial<Pick<UserProfile, "displayName" | "bio" | "interests" | "openToCollaborate" | "chapterId">>,
    ) => {
      if (!session?.user) return { error: "Not authenticated" };

      const user = session.user;
      const payload: Record<string, unknown> = {};
      if (updates.displayName !== undefined) payload.display_name = updates.displayName;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.interests !== undefined) payload.interests = updates.interests;
      if (updates.openToCollaborate !== undefined) payload.open_to_collaborate = updates.openToCollaborate;
      if (updates.chapterId !== undefined) payload.chapter_id = updates.chapterId ?? null;

      // PostgREST can return a successful response for an UPDATE that matched
      // zero rows. Require the authenticated user's canonical profile row to be
      // returned before reporting success so onboarding/profile edits cannot be
      // silently dropped when hydration failed to create the row or RLS hides it.
      const { data: updatedRow, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

      if (!error && !updatedRow) {
        const message = "Profile update did not persist to an authenticated profile row";
        console.error(message);
        return { error: message };
      }

      if (!error) {
        const token = hydrationGuard.current.snapshot();
        const refreshed = await fetchProfile(user);
        if (
          hydrationGuard.current.isCurrent(token) &&
          activeUserIdRef.current === user.id
        ) {
          setProfile(refreshed);
        }
      }
      return { error: error?.message ?? null };
    },
    [session?.user, fetchProfile],
  );

  const needsOnboarding = Boolean(session?.user && (!profile || !profile.displayName?.trim()));

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
