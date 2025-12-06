import { findPokemonByName, insertPokemon, IPokemon, upsertPokemon } from "@/db/models/pokemon";

interface NamedAPIResource {
  name: string;
  url: string;
}

interface PokemonAbility {
  ability: NamedAPIResource;
  is_hidden: boolean;
  slot: number;
}

interface PokemonCries {
  latest: string;
  legacy: string;
}

interface VersionGameIndex {
  game_index: number;
  version: NamedAPIResource;
}

interface PokemonHeldItemVersion {
  rarity: number;
  version: NamedAPIResource;
}

interface PokemonHeldItem {
  item: NamedAPIResource;
  version_details: PokemonHeldItemVersion[];
}

interface PokemonMoveVersion {
  level_learned_at: number;
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
}

interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: PokemonMoveVersion[];
}

interface PastAbilityEntry {
  ability: NamedAPIResource | null;
  is_hidden: boolean;
  slot: number;
}

interface PokemonPastAbility {
  abilities: PastAbilityEntry[];
  generation: NamedAPIResource;
}

interface SpriteSprites {
  back_default: string | null;
  back_female: string | null;
  back_shiny: string | null;
  back_shiny_female: string | null;
  front_default: string | null;
  front_female: string | null;
  front_shiny: string | null;
  front_shiny_female: string | null;
  back_gray?: string | null;
  back_transparent?: string | null;
  front_gray?: string | null;
  front_transparent?: string | null;
  animated?: SpriteSprites;
}

interface OtherSprites {
  dream_world: {
    front_default: string | null;
    front_female: string | null;
  };
  home: {
    front_default: string | null;
    front_female: string | null;
    front_shiny: string | null;
    front_shiny_female: string | null;
  };
  "official-artwork": {
    front_default: string | null;
    front_shiny: string | null;
  };
  showdown: SpriteSprites;
}

interface GenerationISprites {
  "red-blue": SpriteSprites;
  yellow: SpriteSprites;
}

interface GenerationIISprites {
  crystal: SpriteSprites;
  gold: SpriteSprites;
  silver: SpriteSprites;
}

interface GenerationIIISprites {
  emerald: SpriteSprites;
  "firered-leafgreen": SpriteSprites;
  "ruby-sapphire": SpriteSprites;
}

interface GenerationIVSprites {
  "diamond-pearl": SpriteSprites;
  "heartgold-soulsilver": SpriteSprites;
  platinum: SpriteSprites;
}

interface GenerationVSprites {
  "black-white": SpriteSprites;
}

interface GenerationVISprites {
  "omegaruby-alphasapphire": SpriteSprites;
  "x-y": SpriteSprites;
}

interface GenerationVIISprites {
  icons: SpriteSprites;
  "ultra-sun-ultra-moon": SpriteSprites;
}

interface GenerationVIIISprites {
  icons: SpriteSprites;
}

interface PokemonVersions {
  "generation-i": GenerationISprites;
  "generation-ii": GenerationIISprites;
  "generation-iii": GenerationIIISprites;
  "generation-iv": GenerationIVSprites;
  "generation-v": GenerationVSprites;
  "generation-vi": GenerationVISprites;
  "generation-vii": GenerationVIISprites;
  "generation-viii": GenerationVIIISprites;
}

interface PokemonSprites extends SpriteSprites {
  other: OtherSprites;
  versions: PokemonVersions;
}

interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonResponse {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: PokemonAbility[];
  forms: NamedAPIResource[];
  game_indices: VersionGameIndex[];
  held_items: PokemonHeldItem[];
  location_area_encounters: string;
  moves: PokemonMove[];
  species: NamedAPIResource;
  sprites: PokemonSprites;
  cries: PokemonCries;
  stats: PokemonStat[];
  types: PokemonType[];
  past_abilities: PokemonPastAbility[];
  past_types: { generation: NamedAPIResource; types: PokemonType[] }[];
}

export interface PokemonsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export async function RequestPokemon(pokemon: string): Promise<PokemonResponse | null> {
  const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
  console.log(resp)

  if (resp.ok) {
    return resp.json()
  }

  return null
}

export async function RequestListPokemons(limit: number, offset: number): Promise<PokemonsListResponse|null>  {
  const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`)
  console.log(resp)

  if (resp.ok) {
    return resp.json()
  }

  return null
}