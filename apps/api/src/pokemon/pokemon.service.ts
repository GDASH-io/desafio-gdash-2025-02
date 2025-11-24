import { Injectable, Logger } from '@nestjs/common'
import {
  PaginatedResponseType,
  PokemonDetailType,
  PokemonListItemType,
} from '@repo/shared'

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name)
  private readonly baseUrl = 'https://pokeapi.co/api/v2'

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseType<PokemonListItemType>> {
    this.logger.debug(`Fetching pokemon list: page=${page}, limit=${limit}`)
    const offset = (page - 1) * limit
    const response = await fetch(
      `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`,
    )
    const data = (await response.json()) as any

    const items: PokemonListItemType[] = data.results.map(
      (pokemon: { name: string; url: string }) => {
        const id = parseInt(pokemon.url.split('/').filter(Boolean).pop() || '0')
        return {
          id,
          name: pokemon.name,
          url: pokemon.url,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        }
      },
    )

    return {
      items,
      meta: {
        page,
        limit,
        total: data.count,
        totalPages: Math.ceil(data.count / limit),
      },
    }
  }

  async findById(id: number): Promise<PokemonDetailType> {
    this.logger.debug(`Fetching pokemon detail: id=${id}`)
    const response = await fetch(`${this.baseUrl}/pokemon/${id}`)
    const data = (await response.json()) as any

    return {
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      types: data.types.map(
        (t: { type: { name: string } }) => t.type.name,
      ),
      abilities: data.abilities.map(
        (a: { ability: { name: string } }) => a.ability.name,
      ),
      stats: data.stats.map(
        (s: { stat: { name: string }; base_stat: number }) => ({
          name: s.stat.name,
          value: s.base_stat,
        }),
      ),
      sprites: {
        front: data.sprites.front_default,
        back: data.sprites.back_default,
      },
    }
  }
}
