import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

const mockGet = vi.fn();

vi.mock('../lib/api', () => ({
    api: {
        get: mockGet,
    },
}));

describe('useExplorer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGet.mockImplementation((url, { params } = {} as any) => {
            if (url === '/explorer/pokemon') {
                return Promise.resolve({
                    data: {
                        count: 2,
                        next: null,
                        previous: null,
                        page: params?.page ?? 1,
                        limit: params?.limit ?? 10,
                        totalPages: 1,
                        results: [
                            { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/pikachu' },
                            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/bulbasaur' },
                        ],
                    },
                });
            }
            return Promise.resolve({
                data: {
                    id: 25,
                    name: 'pikachu',
                    sprite: 'img.png',
                    types: ['electric'],
                    stats: [{ name: 'speed', value: 90 }],
                },
            });
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('carrega página inicial e navega entre páginas', async () => {
        const mod = await import('./useExplorer');
        const { result } = renderHook(() => mod.useExplorer(2));

        await waitFor(() => expect(result.current.pokemons.length).toBe(2));
        expect(mockGet).toHaveBeenCalledWith('/explorer/pokemon', { params: { page: 1, limit: 2 } });
        expect(result.current.page).toBe(1);
        expect(result.current.totalPages).toBe(1);

        await act(async () => {
            await result.current.previousPage();
        });
        expect(result.current.page).toBe(1);
    });

    it('busca detalhes de um pokemon e lida com erro', async () => {
        const mod = await import('./useExplorer');
        const { result } = renderHook(() => mod.useExplorer(2));

        await waitFor(() => expect(result.current.pokemons.length).toBe(2));

        await act(async () => {
            await result.current.fetchDetail('pikachu');
        });
        expect(mockGet).toHaveBeenCalledWith('/explorer/pokemon/pikachu');
        expect(result.current.detail?.name).toBe('pikachu');

        mockGet.mockRejectedValueOnce(new Error('fail'));
        await act(async () => {
            await result.current.fetchDetail('missingno');
        });
        expect(result.current.detailError).toContain('N\u00e3o foi poss\u00edvel carregar os detalhes.');
    });
});
