import { useContext } from "react";
import { AuthContext } from "../context/AuthContextDefinition";
import type { IAuthContext } from "../interfaces/auth.interface";

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
