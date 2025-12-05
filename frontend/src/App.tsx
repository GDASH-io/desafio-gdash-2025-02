import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import DashboardLayout from './components/DashboardLayout';
import './index.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import LaunchesPage from './pages/Launches';
import SpaceXDetail from './pages/SpaceXDetail';

function App() {
  return (
    <BrowserRouter>
      <Toaster duration={5000} richColors/>
      <Routes>
        {/* Rota de Login (Não Protegida) */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas - Usam o DashboardLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="launches" element={<LaunchesPage />} />
            <Route path="launches/:id" element={<SpaceXDetail />} />
          </Route>
        {/* Qualquer outra rota redireciona para a home (que checa a autenticação) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;