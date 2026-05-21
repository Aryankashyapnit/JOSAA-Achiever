import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read token once from localStorage on mount — never triggers a re-render storm
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<User | null>(null);

  // Only hit /api/auth/me when we actually have a token.
  // retry: false — a 401 means the token is bad; don't hammer the server.
  const {
    data: meData,
    isLoading: isMeLoading,
    isError: isMeError,
  } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      // Don't re-fetch in the background — this is a session check, not live data
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  // Sync the user object when the /me response arrives
  useEffect(() => {
    if (meData) {
      setUser(meData);
    }
  }, [meData]);

  // Only log out when the token verification actually fails AND we had a token.
  // This prevents spurious logouts from stale query state on re-mount.
  useEffect(() => {
    if (isMeError && token) {
      logout();
    }
  }, [isMeError]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (newToken: string, newUser: User) => {
    try {
      localStorage.setItem("token", newToken);
    } catch {
      // localStorage unavailable (private mode, storage full) — still proceed in-memory
    }
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
  };

  // We're "loading" only when: we have a token AND the /me query is still in-flight
  // AND we haven't resolved the user yet.
  const isLoading = !!token && isMeLoading && !user;

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect AFTER the loading phase is complete.
    // If we redirect while still loading we create the blank-screen flash.
    if (!isLoading && !isLoggedIn) {
      setLocation("/login");
    }
  }, [isLoading, isLoggedIn, setLocation]);

  // Still verifying the stored token — show a neutral full-screen loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Token absent or invalid — render nothing while the redirect fires
  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}
