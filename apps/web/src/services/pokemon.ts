import { PaginatedResponseType, PokemonDetailType, PokemonListItemType } from '@repo/shared'

import { api } from '@/lib/api'

export async function fetchPokemonList(
  page = 1,
  limit = 20,
): Promise<PaginatedResponseType<PokemonListItemType>> {
  const response = await api.get('/api/explore/pokemon', { params: { page, limit } })
  return response.data
}

export async function fetchPokemonById(id: number): Promise<PokemonDetailType> {
  const response = await api.get(`/api/explore/pokemon/${id}`)
  return response.data
}
