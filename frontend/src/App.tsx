import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from "@/components/custom/LoginForm";
import DashboardLayout from './layouts/DashboardLayout'; 
import { DashboardContent } from './pages/DashboardContent'; 
import { UsersPage } from './pages/UsersPage'; 

interface ProtectedRouteProps {
  element: React.ElementType;
  requireAdmin?: boolean; 
}

function ProtectedRoute({ element: Element, requireAdmin = false }: ProtectedRouteProps) {
  const { isLoggedIn, isAdmin } = useAuth(); 
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Element />;
}

function LoginPageWrapper() {
    const { isLoggedIn, handleLogin } = useAuth();
    if (isLoggedIn) return <Navigate to="/dashboard" replace />;
    return <LoginForm onLoginSuccess={handleLogin} />;
}

export default function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPageWrapper />} />
                <Route path="/" element={<ProtectedRoute element={DashboardLayout} />}>
                    <Route path="dashboard" element={<DashboardContent />} /> 
                    <Route 
                      path="users" 
                      element={<ProtectedRoute element={UsersPage} requireAdmin={true} />} 
                    /> 
                    <Route index element={<Navigate to="/dashboard" replace />} />
                </Route>
                <Route path="*" element={<p className="text-center pt-20 text-slate-500">404 | Página não encontrada</p>} /> 
            </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}