import React, { useState, type ReactNode, useCallback } from "react";
import { AuthContext } from "./AuthContextDefinition";
import type {
  IAuthContext,
  ILoginResponse,
} from "../interfaces/auth.interface";
import api from "../service/api";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const isAuthenticated = !!token;

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<ILoginResponse>("/auth/login", {
      email,
      password,
    });
    const { access_token } = response.data;
    setToken(access_token);
    localStorage.setItem("token", access_token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  const value: IAuthContext = {
    token,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
