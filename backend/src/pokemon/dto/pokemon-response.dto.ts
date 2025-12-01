import { ApiProperty } from '@nestjs/swagger';

class PokemonStatDto {
  @ApiProperty({ example: 'hp' })
  name: string;

  @ApiProperty({ example: 35 })
  value: number;
}

class PokemonSpritesDto {
  @ApiProperty({ example: 'https://raw.githubusercontent.com/...' })
  front_default: string;

  @ApiProperty({ example: 'https://raw.githubusercontent.com/...' })
  front_shiny: string;

  @ApiProperty({ example: 'https://raw.githubusercontent.com/...' })
  official_artwork: string;
}

export class PokemonDetailResponseDto {
  @ApiProperty({ example: 25 })
  id: number;

  @ApiProperty({ example: 'pikachu' })
  name: string;

  @ApiProperty({ example: 4 })
  height: number;

  @ApiProperty({ example: 60 })
  weight: number;

  @ApiProperty({ example: ['electric'], type: [String] })
  types: string[];

  @ApiProperty({ example: ['static', 'lightning-rod'], type: [String] })
  abilities: string[];

  @ApiProperty({ type: [PokemonStatDto] })
  stats: PokemonStatDto[];

  @ApiProperty({ type: PokemonSpritesDto })
  sprites: PokemonSpritesDto;
}

export class PokemonListResponseDto {
  @ApiProperty({ example: 1281 })
  count: number;

  @ApiProperty({
    example: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
  })
  next: string;

  @ApiProperty({ example: null })
  previous: string | null;

  @ApiProperty({ type: [PokemonDetailResponseDto] })
  results: PokemonDetailResponseDto[];
}
