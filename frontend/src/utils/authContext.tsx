import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "./authService.ts";

import type { AuthUser, AuthContextType } from "../interface/types.ts";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authService.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Kunde inte restorera sessionen:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();
  }, []);

  async function login(username: string, password: string) {
    const response = await authService.login(username, password);

    localStorage.setItem("token", response.token);
    setUser(response.user);
  }

  async function register(
    username: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    await authService.register(username, email, password);

    try {
      await login(username, password);
      return true;
    } catch {
      return false;
    }
  }

  function updateUser(updatedUser: AuthUser) {
    setUser(updatedUser);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth måste användas inuti en AuthProvider");
  }

  return context;
}
