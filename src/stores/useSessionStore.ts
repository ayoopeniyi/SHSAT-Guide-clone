import { create } from "zustand";

export type UserType = "teacher" | "admin" | null;

interface SessionState {
  userType: UserType;
  user: string | null;
  isAuthenticated: boolean;
  currentPage: string;
  previousPage: string;
  login: (userType: UserType, user: string) => void;
  logout: () => void;
  setPage: (path: string) => void;
}

const SESSION_KEY = "sessionState";

function getInitialState(): Omit<SessionState, "login" | "logout" | "setPage"> {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
  }
  return {
    userType: null,
    user: null,
    isAuthenticated: false,
    currentPage: "",
    previousPage: "",
  };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  ...getInitialState(),
  login: (userType, user) => {
    set({ userType, user, isAuthenticated: true });
  },
  logout: () => {
    set({
      userType: null,
      user: null,
      isAuthenticated: false,
      currentPage: "",
      previousPage: "",
    });
    if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_KEY);
  },
  setPage: (path) => {
    const { currentPage } = get();
    set({ previousPage: currentPage, currentPage: path });
  },
}));

// Persist to sessionStorage on state change
if (typeof window !== "undefined") {
  useSessionStore.subscribe((state) => {
    const { login, logout, setPage, ...persisted } = state;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(persisted));
  });
}

// Helper hook for easy access
export const useSession = () => useSessionStore();
