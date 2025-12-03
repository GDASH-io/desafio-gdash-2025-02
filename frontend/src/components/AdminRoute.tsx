import { Navigate } from 'react-router-dom'
import { isAuthenticated, getCurrentUser } from '../services/api'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const user = getCurrentUser()
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

