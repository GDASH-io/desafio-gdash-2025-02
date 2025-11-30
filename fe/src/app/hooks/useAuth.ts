import { use } from "react";
import { AuthCtx } from "../contexts/AuthContext";

export const useAuth = () => {
  const ctx = use(AuthCtx);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}