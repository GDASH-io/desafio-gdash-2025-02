import { findManyPokemonsByName, findPokemonByName, upsertPokemon } from "@/db/models/pokemon";
import { Pokemon, PokemonFromDb, PokemonFromResponse, PokemontoDb } from "./types";
import { RequestPokemon } from "./request";


export async function HandleGetPokemon(name: string): Promise<Pokemon|null> {
  const dbResult = await findPokemonByName(name)
  if(dbResult && dbResult.info != undefined) {
    return PokemonFromDb(dbResult)
  }

  const result = await RequestPokemon(name)
  if(!result) {
    return null
  }
  const pokemon = PokemonFromResponse(result)

  upsertPokemon(PokemontoDb(pokemon))
  return pokemon
}

export async function HandleSeachPokemons(search: string, page: number): Promise<(Pokemon|null)[]> {
  const result = await findManyPokemonsByName(search, page, 12)
  let responses = result.map(async p => {
    return PokemonFromDb(p) || await HandleGetPokemon(p.name)
  })

  return Promise.all(responses)
}