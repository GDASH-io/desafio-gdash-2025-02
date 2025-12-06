import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>; 
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}