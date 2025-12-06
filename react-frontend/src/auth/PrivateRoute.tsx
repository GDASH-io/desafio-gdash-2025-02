import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: string[];
}

// Componente que protege rotas - só renderiza children se usuário estiver autenticado
// Se roles for fornecido, verifica se o usuário tem permissão (ex: admin)
export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <p>Loading authentication...</p>;
  }

  // Redireciona para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verifica permissões de role se especificado (ex: apenas admin pode acessar)
  if (roles && user && !roles.includes(user.roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
