import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AdminRoute() {
  const { user , isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.typer_usuario !== 'A') {
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
}