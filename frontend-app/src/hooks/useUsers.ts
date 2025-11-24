import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/service/api';

export interface User {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}

export const useUsers = () => {
    const query = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get<User[]>('/users');
            return data;
        },
    });

    return {
        users: query.data,
        loading: query.isLoading,
        refetch: query.refetch
    };
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (newUser: any) => {
            try {
                await api.post('/users', newUser);
            } catch (error: any) {
                throw new Error(error.response?.data?.message || "Erro ao criar usuário");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    return {
        createUser: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error instanceof Error ? mutation.error.message : null,
    };
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    return {
        deleteUser: mutation.mutateAsync,
        loading: mutation.isPending
    };
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            try {
                const payload = { ...data };
                if (!payload.password) delete payload.password;
                
                await api.patch(`/users/${id}`, payload);
            } catch (error: any) {
                throw new Error(error.response?.data?.message || "Erro ao atualizar utilizador");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    return {
        updateUser: mutation.mutateAsync,
        loading: mutation.isPending,
        error: mutation.error instanceof Error ? mutation.error.message : null,
    };
};