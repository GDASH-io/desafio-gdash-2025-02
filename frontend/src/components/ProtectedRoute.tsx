import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useEffect } from 'react'

export const ProtectedRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    useEffect(() => {
        console.log('ProtectedRoute - isAuthenticated:', isAuthenticated)
    }, [isAuthenticated])

    if (!isAuthenticated) {
        console.log('ProtectedRoute - Redirecting to login')
        return <Navigate to="/login" replace />
    }

    console.log('ProtectedRoute - Allowing access')
    return <Outlet />
}
