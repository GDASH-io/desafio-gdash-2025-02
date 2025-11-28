import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { api, authHeaders } from '../lib/api';

const formatErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data?.message;
        if (Array.isArray(payload)) {
            return payload.join(' | ');
        }
        if (typeof payload === 'string') {
            return payload;
        }
        return error.message || fallback;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return fallback;
};

export type UserRow = {
    _id?: string;
    email: string;
    name: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateUserPayload = {
    email: string;
    name: string;
    password: string;
};

export type UpdateUserPayload = {
    email?: string;
    name?: string;
    password?: string;
};

export type UsersState = {
    users: UserRow[];
    fetching: boolean;
    busy: boolean;
    error: string;
    fetchUsers: () => Promise<void>;
    createUser: (payload: CreateUserPayload) => Promise<void>;
    updateUser: (id: string, payload: UpdateUserPayload) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
};

export function useUsers(token: string | null): UsersState {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [fetching, setFetching] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = useCallback(async () => {
        if (!token) {
            setUsers([]);
            setError('');
            setFetching(false);
            return;
        }

        setFetching(true);
        try {
            const response = await api.get<UserRow[]>('/users', {
                headers: authHeaders(token ?? undefined)
            });
            setUsers(response.data);
            setError('');
        } catch (err) {
            setError(formatErrorMessage(err, 'Falha ao carregar usuários.'));
        } finally {
            setFetching(false);
        }
    }, [token]);

    const mutate = useCallback(
        async (fn: () => Promise<void>, fallback: string) => {
            if (!token) {
                return;
            }
            setBusy(true);
            try {
                await fn();
                setError('');
                await fetchUsers();
            } catch (err) {
                const message = formatErrorMessage(err, fallback);
                setError(message);
                throw err;
            } finally {
                setBusy(false);
            }
        },
        [token, fetchUsers]
    );

    const createUser = useCallback(
        async (payload: CreateUserPayload) => {
            await mutate(
                () => api.post('/users', payload, { headers: authHeaders(token ?? undefined) }),
                'Erro ao criar usuário.'
            );
        },
        [mutate, token]
    );

    const updateUser = useCallback(
        async (id: string, payload: UpdateUserPayload) => {
            await mutate(
                () => api.patch(`/users/${id}`, payload, { headers: authHeaders(token ?? undefined) }),
                'Erro ao atualizar usuário.'
            );
        },
        [mutate, token]
    );

    const deleteUser = useCallback(
        async (id: string) => {
            await mutate(
                () => api.delete(`/users/${id}`, { headers: authHeaders(token ?? undefined) }),
                'Erro ao remover usuário.'
            );
        },
        [mutate, token]
    );

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        fetching,
        busy,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser
    };
}
