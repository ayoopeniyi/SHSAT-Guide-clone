import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { usePostHogAnalytics } from "../lib/posthog-analytics";

interface User {
  id: string;
  email: string;
  role?: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setAdmin: (isAdmin: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getUserName: () => string;
}

// Helper function to get name from email
const getNameFromEmail = (email: string): string => {
  return email.split("@")[0].replace(/[._-]/g, " ");
};

// Helper function to get user info from user_roles
const getUserInfo = async (
  userId: string,
): Promise<{ role: string; name: string }> => {
  const { data: roleData, error } = await supabase
    .from("user_roles")
    .select("role, name")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user role:", error);
    return { role: "teacher", name: "" };
  }

  return {
    role: roleData?.role || "teacher",
    name: roleData?.name || "",
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: false,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  getUserName: () => {
    const user = get().user;
    if (!user) return "Unknown";
    return user.name || getNameFromEmail(user.email);
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { role, name } = await getUserInfo(data.user.id);

        const userData = {
          id: data.user.id,
          email: data.user.email!,
          role,
          name,
        };

        set({
          user: userData,
          isAdmin: role === "admin",
          isLoading: false,
        });

        // Note: Analytics tracking is now handled in the Login component
        // to ensure proper user identification after successful login
      }
    } catch (error) {
      console.error("Login error:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during login",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Insert name and email into user_roles
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "teacher",
          name,
          email,
        });

        const userData = {
          id: data.user.id,
          email: data.user.email!,
          role: "teacher",
          name,
        };

        set({
          user: userData,
          isAdmin: false,
        });

        // Note: Analytics tracking is now handled in the Signup component
        // to ensure proper user identification after successful signup
      }
    } catch (error) {
      console.error("Signup error:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during signup",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      // Try to sign out, but don't fail if session is already invalid
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('session_not_found')) {
        throw error;
      }
      set({ user: null, isAdmin: false, isLoading: false });
    } catch (error) {
      // Even if logout fails, clear local state
      set({ user: null, isAdmin: false, isLoading: false });
      console.warn('Logout error (clearing local state anyway):', error);
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        // If session error, clear local state
        console.warn('Session check failed:', error);
        set({ user: null, isAdmin: false, isLoading: false });
        return;
      }

      if (session?.user) {
        try {
          const { role, name } = await getUserInfo(session.user.id);

          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
              role,
              name,
            },
            isAdmin: role === "admin",
            isLoading: false,
          });
        } catch (userInfoError) {
          // If we can't get user info, the session might be invalid
          console.warn('Failed to get user info, clearing session:', userInfoError);
          set({ user: null, isAdmin: false, isLoading: false });
        }
      } else {
        set({ user: null, isAdmin: false, isLoading: false });
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
      set({ user: null, isAdmin: false, isLoading: false });
    }
  },
}));
