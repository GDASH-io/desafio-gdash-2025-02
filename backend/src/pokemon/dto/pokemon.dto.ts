export interface PokemonDto {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonSprites {
  front_default: string;
  front_shiny: string;
  official_artwork: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonDto[];
}
