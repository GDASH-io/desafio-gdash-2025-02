import api from './api'

export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonListResponse {
  data: PokemonListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: {
    name: string
    url: string
  }
}

export interface PokemonSprites {
  front_default: string
  front_shiny: string
  back_default: string
  back_shiny: string
}

export interface PokemonDetail {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  types: PokemonType[]
  stats: PokemonStat[]
  sprites: PokemonSprites
  order: number
}

export const pokemonService = {
  async getList(
    page: number = 1,
    limit: number = 20
  ): Promise<PokemonListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const url = `/pokemon?${params.toString()}`

    try {
      const response = await api.get<{ success: boolean; data: PokemonListResponse }>(url)
      return response.data.data || response.data
    } catch (error: any) {
      throw error
    }
  },

  async getDetail(idOrName: string): Promise<PokemonDetail> {
    const response = await api.get<{ success: boolean; data: PokemonDetail }>(
      `/pokemon/${idOrName}`
    )
    return response.data.data || response.data
  },
}

