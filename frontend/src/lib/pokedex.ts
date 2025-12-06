import { API_BASE_URL } from "./client"

export interface PokemonResponse {
  name: string
  spriteUrl: string
  audioUrl: string
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
}

export async function RequestPokemon(name: string): Promise<PokemonResponse | null> {
  const resp = await fetch(`${API_BASE_URL}/api/pokedex/pokemon?name=${name}`)
  console.log(resp)

  if (resp.ok) {
    return resp.json()
  }

  return null
}

export async function RequestListPokemons(page: number, search: string): Promise<(PokemonResponse | null)[]>  {
  const resp = await fetch(`${API_BASE_URL}/api/pokedex?page=${page}&search=${search}`)
  console.log(resp)

  if (resp.ok) {
    return resp.json()
  }

  return []
}