import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setAuthToken } from "../services/api";
import { User, LoginResponse } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setAuthToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });
    
    setToken(data.accessToken);
    setUser(data.user);
    setAuthToken(data.accessToken);
    localStorage.setItem("token", data.accessToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(undefined);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
