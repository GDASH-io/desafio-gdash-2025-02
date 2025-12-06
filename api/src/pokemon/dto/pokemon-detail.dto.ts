export class PokemonTypeDto {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export class PokemonStatDto {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export class PokemonSpritesDto {
  front_default: string;
  front_shiny: string;
  back_default: string;
  back_shiny: string;
}

export class PokemonDetailDto {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonTypeDto[];
  stats: PokemonStatDto[];
  sprites: PokemonSpritesDto;
  order: number;
}
