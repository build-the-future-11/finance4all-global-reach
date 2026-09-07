import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/domain";

export interface AuthContextValue {
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
  updateProfile: (
    updates: Partial<
      Pick<
        UserProfile,
        "displayName" | "bio" | "interests" | "openToCollaborate" | "chapterId"
      >
    >,
  ) => Promise<{ error: string | null }>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
