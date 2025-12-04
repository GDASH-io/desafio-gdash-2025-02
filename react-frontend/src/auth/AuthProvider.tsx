import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  token: string | null;
  user: { email: string; roles: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<{ email: string; roles: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: decoded.email, roles: decoded.roles });
      } catch (e) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('jwt_token');
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('jwt_token', newToken);
      const decoded = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ email: decoded.email, roles: decoded.roles });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { email, password });
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('jwt_token', newToken);
      const decoded = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ email: decoded.email, roles: decoded.roles });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt_token');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
