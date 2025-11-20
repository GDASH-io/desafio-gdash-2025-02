import { Navigate } from 'react-router-dom';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas públicas (como login)
 * Redireciona usuários autenticados para o dashboard
 */
export default function GuestRoute({ children }: GuestRouteProps) {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

