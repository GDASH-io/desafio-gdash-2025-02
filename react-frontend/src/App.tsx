import { Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <WeatherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <WeatherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/movies"
              element={
                <PrivateRoute>
                  <MovieList />
                </PrivateRoute>
              }
            />
            <Route
              path="/movies/:id"
              element={
                <PrivateRoute>
                  <MovieDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute roles={['admin']}>
                  <UserManagement />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
        <Toaster />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
