import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

export type PokemonSummary = {
    name: string;
    url: string;
};

export type PokemonDetail = {
    id: number;
    name: string;
    sprite?: string | null;
    types: string[];
    stats: { name: string; value: number }[];
};

type ExplorerListResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    page: number;
    limit: number;
    totalPages: number;
    results: PokemonSummary[];
};

export function useExplorer(defaultLimit = 10) {
    const [pokemons, setPokemons] = useState<PokemonSummary[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(defaultLimit);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [listError, setListError] = useState('');
    const [detail, setDetail] = useState<PokemonDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');

    const totalPages = useMemo(() => Math.max(1, Math.ceil(count / limit)), [count, limit]);

    const loadPage = useCallback(
        async (targetPage: number) => {
            setLoading(true);
            try {
                const response = await api.get<ExplorerListResponse>('/explorer/pokemon', {
                    params: { page: Math.max(1, targetPage), limit }
                });
                setPokemons(response.data.results);
                setCount(response.data.count);
                setPage(response.data.page);
                setListError('');
            } catch (error) {
                console.error('Erro ao carregar pokemons', error);
                setListError('Não foi possível carregar os pokemons da PokéAPI.');
            } finally {
                setLoading(false);
            }
        },
        [limit]
    );

    const fetchDetail = useCallback(async (name: string) => {
        setDetailLoading(true);
        try {
            const response = await api.get<PokemonDetail>(`/explorer/pokemon/${name}`);
            setDetail(response.data);
            setDetailError('');
        } catch (error) {
            console.error('Erro ao carregar detalhe do pokemon', error);
            setDetail(null);
            setDetailError('Não foi possível carregar os detalhes.');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const clearDetail = useCallback(() => setDetail(null), []);

    useEffect(() => {
        void loadPage(1);
    }, [loadPage]);

    const nextPage = useCallback(() => {
        if (page >= totalPages) return;
        void loadPage(page + 1);
    }, [page, totalPages, loadPage]);

    const previousPage = useCallback(() => {
        if (page <= 1) return;
        void loadPage(page - 1);
    }, [page, loadPage]);

    return {
        pokemons,
        page,
        limit,
        totalPages,
        count,
        loading,
        listError,
        detail,
        detailLoading,
        detailError,
        loadPage,
        nextPage,
        previousPage,
        fetchDetail
        ,
        clearDetail
    };
}
