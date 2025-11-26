import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from "@/components/ui/spinner"; // Componente de loading simples

interface ProtectedRouteProps {
  component: React.ElementType; // Recebe o componente da página a ser protegida (Dashboard)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />; // Mostra um spinner enquanto verifica a sessão
  }

  // Se estiver autenticado, renderiza o componente (Dashboard)
  if (isAuthenticated) {
    return <Component />;
  }

  // Se NÃO estiver autenticado, redireciona para a página de login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;