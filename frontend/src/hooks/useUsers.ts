import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI, User } from '@/services/api'

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: usersAPI.getAll,
    })
}

export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => usersAPI.getById(id),
        enabled: !!id,
    })
}

export const useCreateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (user: Omit<User, 'id' | 'createdAt'>) => usersAPI.create(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, user }: { id: string; user: Partial<User> }) =>
            usersAPI.update(id, user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => usersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}
