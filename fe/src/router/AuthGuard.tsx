import { useAuth } from "@/app/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface AuthGuardProps {
  isPrivate?: boolean;
}

function AuthGuard({ isPrivate = false }: AuthGuardProps) {
  const { isSignedIn } = useAuth();

  const path = useLocation().pathname
  if (!isSignedIn && isPrivate) {
    return <Navigate to="/signin" replace />;
  }

  if (isSignedIn && !isPrivate && (path === "/signin")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
export default AuthGuard;