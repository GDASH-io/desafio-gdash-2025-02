import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: string[];
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <p>Loading authentication...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
