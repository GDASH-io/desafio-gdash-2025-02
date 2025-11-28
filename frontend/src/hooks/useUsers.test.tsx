import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock('../lib/api', () => ({
    api: {
        get: mockGet,
        post: mockPost,
        patch: mockPatch,
        delete: mockDelete,
    },
    authHeaders: () => ({}),
}));

describe('useUsers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGet.mockResolvedValue({ data: [] });
        mockPost.mockResolvedValue({ data: {} });
        mockPatch.mockResolvedValue({ data: {} });
        mockDelete.mockResolvedValue({ data: {} });
    });

    it('carrega usuarios na inicialização quando há token', async () => {
        const mod = await import('./useUsers');
        const { result } = renderHook(() => mod.useUsers('token'));

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith('/users', { headers: {} });
            expect(result.current.users).toEqual([]);
            expect(result.current.error).toBe('');
        });
    });

    it('cria, atualiza e remove usuários com refetch', async () => {
        const mod = await import('./useUsers');
        mockGet.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({
            data: [{ _id: '1', email: 'u@test.com', name: 'User' }],
        });

        const { result } = renderHook(() => mod.useUsers('token'));

        await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));

        await act(async () => {
            await result.current.createUser({ email: 'u@test.com', name: 'User', password: '123456' });
        });
        expect(mockPost).toHaveBeenCalledWith('/users', { email: 'u@test.com', name: 'User', password: '123456' }, { headers: {} });
        await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
        expect(result.current.users).toEqual([{ _id: '1', email: 'u@test.com', name: 'User' }]);

        await act(async () => {
            await result.current.updateUser('1', { name: 'New' });
        });
        expect(mockPatch).toHaveBeenCalledWith('/users/1', { name: 'New' }, { headers: {} });

        await act(async () => {
            await result.current.deleteUser('1');
        });
        expect(mockDelete).toHaveBeenCalledWith('/users/1', { headers: {} });
    });

    it('expõe mensagem de erro quando request falha', async () => {
        const mod = await import('./useUsers');
        mockGet.mockRejectedValueOnce(new Error('boom'));

        const { result } = renderHook(() => mod.useUsers('token'));

        await waitFor(() => {
            expect(result.current.error).toContain('boom');
            expect(result.current.users).toEqual([]);
        });
    });
});
