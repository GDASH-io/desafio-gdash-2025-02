import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Users from './pages/Users'
import Pokemon from './pages/Pokemon'
import StarWars from './pages/StarWars'
import Games from './pages/Games'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
          <Route
            path="/pokemon"
            element={
              <ProtectedRoute>
                <Pokemon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/starwars"
            element={
              <ProtectedRoute>
                <StarWars />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  )
}

export default App

