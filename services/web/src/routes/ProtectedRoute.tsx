import { useAuthStore } from "@/features/auth/hooks/useAuthStore"
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    return <>{children}</>;
};