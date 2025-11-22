import { useQuery } from '@tanstack/react-query';
import { api } from '@/service/api';
import { useState } from 'react';

export const usePlanets = () => {
    const [page, setPage] = useState(1);

    const query = useQuery({
        queryKey: ['planets', page],
        queryFn: async () => {
            const { data } = await api.get(`/swapi/planets?page=${page}`);
            return data;
        },
        staleTime: 60000, 
    });

    return {
        loading: query.isLoading,
        page,
        setPage,
        isPreviousData: query.isPlaceholderData
    };
};