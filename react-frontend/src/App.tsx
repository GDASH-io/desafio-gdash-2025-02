import { Routes, Route, Outlet } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { WeatherDashboard } from './pages/WeatherDashboard'
import { LoginForm } from './auth/LoginForm'
import { RegisterForm } from './auth/RegisterForm'
import { AuthProvider } from './auth/AuthProvider'
import { PrivateRoute } from './auth/PrivateRoute'
import { UserManagement } from './pages/UserManagement'
import { Toaster } from './components/ui/toast'
import { MovieList } from './pages/MovieList'
import { MovieDetail } from './pages/MovieDetail'
import { ToastProvider } from './components/ui/toast'
import { WeatherLogsPage } from './pages/WeatherLogsPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Rotas públicas - não requerem autenticação */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Rotas protegidas - requerem autenticação e layout comum */}
          <Route
            element={
              <Layout>
                <PrivateRoute>
                  <Outlet />
                </PrivateRoute>
              </Layout>
            }
          >
            <Route path="/" element={<WeatherDashboard />} />
            <Route path="/dashboard" element={<WeatherDashboard />} />
            <Route path="/movies" element={<MovieList />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/logs" element={<WeatherLogsPage />} />
            {/* Rota exclusiva para administradores */}
            <Route 
              path="/users" 
              element={
                <PrivateRoute roles={['admin']}>
                  <UserManagement />
                </PrivateRoute>
              } 
            />
          </Route>
        </Routes>
        <Toaster />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
