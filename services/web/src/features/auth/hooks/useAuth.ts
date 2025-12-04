import { useNavigate } from 'react-router-dom'
import { useAuthStore } from './useAuthStore';
import { useMutation } from '@tanstack/react-query';
import { LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/authService';

export const useAuth = () => {
    const navigate = useNavigate();
    const { setAuth, logout: logoutStore, isAuthenticated, user } = useAuthStore();

    const loginMutation = useMutation({
        mutationFn: (data: LoginRequest) => authService.login(data),
        onSuccess: (data) => {
            setAuth(data.user, data.accessToken);
            navigate('/dashboard');
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
        onSuccess: (data) => {
            setAuth(data.user, data.accessToken);
            navigate('/dashboard');
        },
    });

    const logout = () => {
        logoutStore();
        navigate('/login');
    };

    return {
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout,
        isAuthenticated,
        user,
        isLoading: loginMutation.isPaused || registerMutation.isPending,
        error: loginMutation.error || registerMutation.error,
    };
};