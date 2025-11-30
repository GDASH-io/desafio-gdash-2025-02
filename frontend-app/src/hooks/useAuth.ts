import { useMutation } from '@tanstack/react-query';
import { api } from '@/service/api'; 
import { useNavigate } from '@tanstack/react-router';

interface LoginPayload {
    email: string;
    password: string;
}

export const useLogin = () => {
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (credentials: LoginPayload) => {
            try {
                const { data } = await api.post('/auth/login', credentials);

                if (data.access_token) {
                    localStorage.setItem('gdash_token', data.access_token);
                    navigate({ to: '/dashboard' });
                }

                return data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || "Erro ao tentar realizar login");
            }
        },
    });

    return {
        login: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error instanceof Error ? mutation.error.message : null,
    };
};