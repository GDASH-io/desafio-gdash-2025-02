import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Explore } from './pages/Explore';
import { Button } from './components/ui/button';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">GDASH</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-6 py-6">
        <nav className="mb-6">
          <div className="flex gap-4">
            <Link
              to="/dashboard"
              className={`text-blue-600 hover:underline ${
                location.pathname === '/dashboard' ? 'font-bold' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/users"
              className={`text-blue-600 hover:underline ${
                location.pathname === '/users' ? 'font-bold' : ''
              }`}
            >
              Usuários
            </Link>
            <Link
              to="/explore"
              className={`text-blue-600 hover:underline ${
                location.pathname === '/explore' ? 'font-bold' : ''
              }`}
            >
              Explorar
            </Link>
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <Layout>
              <Explore />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

