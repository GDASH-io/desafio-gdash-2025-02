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

interface Pokemon {
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

interface PokemonsList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

async function RequestPokemon(pokemon: string): Promise<Pokemon | null> {
  const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)

  if (resp.ok) {
    return resp.json()
  }

  return null
}

async function RequestListPokemons(limit: number, offset: number): Promise<PokemonsList|null>  {
  const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`)

  if (resp.ok) {
    return resp.json()
  }

  return null
}

export async function PokemonsInsertAll() {
  const all = await RequestListPokemons(-1, 0)
  if (!all) {
    return
  }

  await Promise.all(all.results.map(async (p) => {
    const payload: IPokemon = {
      name: p.name,
    };

    await upsertPokemon(payload);
  }));
}

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

export async function GetPokemon(name: string): Promise<PokemonResponse|null> {
  const dbResult = await findPokemonByName(name)
  if (
    dbResult &&
    dbResult.info != undefined
  ) {
    return {
      name: dbResult.name,
      spriteUrl: dbResult.info.spriteUrl,
      audioUrl: dbResult.info.audioUrl,
      hp: dbResult.info.hp,
      attack: dbResult.info.attack,
      defense: dbResult.info.defense,
      specialAttack: dbResult.info.specialAttack,
      specialDefense: dbResult.info.specialDefense
    }
  }

  const result = await RequestPokemon(name)
  if(!result) {
    return null
  }

  const getStat = (statName: string): number => {
    return result.stats.find(s => s.stat.name === statName)?.base_stat ?? 0;
  };

  const pokemon: IPokemon = {
    name: result.name,
    info: {
      spriteUrl: result.sprites.front_default  || "",
      audioUrl: result.cries.latest ?? "",
      hp: getStat('hp'),
      attack: getStat('attack'),
      defense: getStat('defense'),
      specialAttack: getStat('special-attack'),
      specialDefense: getStat('special-defense')
    }
  };
  upsertPokemon(pokemon)
  if (pokemon.info) {
    const response: PokemonResponse = {
    name: pokemon.name,
    spriteUrl: pokemon.info.spriteUrl,
    audioUrl: pokemon.info.audioUrl,
    hp: pokemon.info.hp,
    attack: pokemon.info.attack,
    defense: pokemon.info.defense,
    specialAttack: pokemon.info.specialAttack,
    specialDefense: pokemon.info.specialDefense
    };
    return response;
  }

  return null;
}