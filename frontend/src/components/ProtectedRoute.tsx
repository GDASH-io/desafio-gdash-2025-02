import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  // ✅ LOG PARA DEBUG
  console.log('🔐 ProtectedRoute executando...');
  console.log('🔐 Token do contexto:', token);
  console.log('🔐 isLoading:', isLoading);
  console.log('🔐 localStorage token:', localStorage.getItem('token'));

  if (isLoading) {
    console.log('⏳ Ainda carregando...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!token) {
    console.log('❌ SEM TOKEN! Redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Token válido! Renderizando rota protegida');
  return <Outlet />;
}
