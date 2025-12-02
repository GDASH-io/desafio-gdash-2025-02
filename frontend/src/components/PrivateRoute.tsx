import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

// Padrão TypeScript: Definir a interface das props
type PrivateRouteProps = {
  children: ReactNode;
};

export function PrivateRoute({ children }: PrivateRouteProps) {
  const token = localStorage.getItem("access_token");

  return token ? children : <Navigate to="/login" replace />;
}
