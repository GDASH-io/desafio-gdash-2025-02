import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

const mockApiPost = vi.fn();

vi.doMock('../lib/api', () => ({
    api: {
        post: mockApiPost,
    },
}));

describe('AuthContext', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.stubEnv('VITE_AUTH_TOKEN_KEY', 'custom_token_key');
        mockApiPost.mockResolvedValue({ data: { access_token: 'token-123' } });
        localStorage.clear();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('persists token usando a chave definida em VITE_AUTH_TOKEN_KEY', async () => {
        const mod = await import('./AuthContext');
        const wrapper = ({ children }: { children: React.ReactNode }) => <mod.AuthProvider>{children}</mod.AuthProvider>;

        const { result } = renderHook(() => mod.useAuth(), { wrapper });

        await act(async () => {
            await result.current.login('user@example.com', 'secret');
        });

        expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
            email: 'user@example.com',
            password: 'secret',
        });
        expect(result.current.token).toBe('token-123');
        expect(localStorage.getItem('custom_token_key')).toBe('token-123');
    });

    it('limpa token e email do storage ao fazer logout', async () => {
        const mod = await import('./AuthContext');
        const wrapper = ({ children }: { children: React.ReactNode }) => <mod.AuthProvider>{children}</mod.AuthProvider>;

        const { result } = renderHook(() => mod.useAuth(), { wrapper });

        await act(async () => {
            await result.current.login('user@example.com', 'secret');
        });

        expect(localStorage.getItem('custom_token_key')).toBe('token-123');

        act(() => {
            result.current.logout();
        });

        expect(result.current.token).toBeNull();
        expect(localStorage.getItem('custom_token_key')).toBeNull();
        expect(localStorage.getItem('gdash_email')).toBeNull();
    });
});
