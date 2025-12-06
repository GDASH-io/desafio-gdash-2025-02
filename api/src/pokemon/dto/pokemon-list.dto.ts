export class PokemonListItemDto {
  name: string;
  url: string;
}

export class PokemonListResponseDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItemDto[];
}
