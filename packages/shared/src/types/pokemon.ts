export interface PokemonListItemType {
  id: number
  name: string
  url: string
  image: string
}

export interface PokemonDetailType {
  id: number
  name: string
  height: number
  weight: number
  types: string[]
  abilities: string[]
  stats: {
    name: string
    value: number
  }[]
  sprites: {
    front: string
    back: string
  }
}
