import { useQuery } from '@tanstack/react-query'
import { pokemonAPI } from '@/services/api'

export const usePokemonList = (page: number, limit = 20) => {
    const offset = page * limit

    return useQuery({
        queryKey: ['pokemon', page, limit],
        queryFn: () => pokemonAPI.getList(offset, limit),
    })
}

export const usePokemon = (name: string) => {
    return useQuery({
        queryKey: ['pokemon', name],
        queryFn: () => pokemonAPI.getByName(name),
        enabled: !!name,
    })
}
