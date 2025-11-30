import { useQuery } from '@tanstack/react-query';
import { api } from '@/service/api';
import { useState, useEffect } from 'react';

export const useSwapi = (category: string) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => setPage(1), [category, search]);

    const query = useQuery({
        queryKey: ['swapi', category, page, search],
        queryFn: async () => {
            let url = `/swapi/${category}?page=${page}`;
            const { data } = await api.get(url);
            return data;
        },
        staleTime: 60000, 
    });

    return {
        data: query.data,
        loading: query.isLoading,
        page,
        setPage,
        search,
        setSearch
    };
};