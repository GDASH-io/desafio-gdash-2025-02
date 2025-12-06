import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PublicRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (token) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
}