import { IPokemon } from "@/db/models/pokemon"
import { PokemonResponse } from "./request"

export interface Pokemon {
  name: string
  spriteUrl: string
  audioUrl: string
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
}

export function PokemonFromDb(pokemon: IPokemon): Pokemon|null {
  if (!pokemon.info) {
    return null
  }

  return{
    name: pokemon.name,
    spriteUrl: pokemon.info.spriteUrl,
    audioUrl: pokemon.info.audioUrl,
    hp: pokemon.info.hp,
    attack: pokemon.info.attack,
    defense: pokemon.info.defense,
    specialAttack: pokemon.info.specialAttack,
    specialDefense: pokemon.info.specialDefense
  }
}

export function PokemontoDb(pokemon: Pokemon): IPokemon {
  return{
    name: pokemon.name,
    info: {
      spriteUrl: pokemon.spriteUrl,
      audioUrl: pokemon.audioUrl,
      hp: pokemon.hp,
      attack: pokemon.attack,
      defense: pokemon.defense,
      specialAttack: pokemon.specialAttack,
      specialDefense: pokemon.specialDefense
    }
  }
}

export function PokemonFromResponse(pokemon: PokemonResponse): Pokemon {
  const getStat = (statName: string): number => {
    return pokemon.stats.find(s => s.stat.name === statName)?.base_stat ?? 0;
  };

  return{
    name: pokemon.name,
    spriteUrl: pokemon.sprites.front_default  || "",
    audioUrl: pokemon.cries.latest ?? "",
    hp: getStat('hp'),
    attack: getStat('attack'),
    defense: getStat('defense'),
    specialAttack: getStat('special-attack'),
    specialDefense: getStat('special-defense')
  }
}