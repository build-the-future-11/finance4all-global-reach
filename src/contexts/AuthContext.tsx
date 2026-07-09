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
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

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
      console.error("Profile ensure failed:", error.message);
      return null;
    }

    return mapProfile(created);
  }, []);

  const fetchProfile = useCallback(
    async (user: User) => {
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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchProfile(data.session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        fetchProfile(nextSession.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
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
    await supabase.auth.signOut();
    setProfile(null);
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

      const { error } = await supabase.from("profiles").update(payload).eq("id", session.user.id);
      if (!error) await fetchProfile(session.user);
      return { error: error?.message ?? null };
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
