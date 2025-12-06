import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { AdminRoute } from './routes/AdminRoute';
import { AppLayout } from './components/layout/AppLayout';

import { Toaster } from 'react-hot-toast';
import { Users } from './pages/users/Users';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Register } from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />

    </AuthProvider>
  );
}

export default App;