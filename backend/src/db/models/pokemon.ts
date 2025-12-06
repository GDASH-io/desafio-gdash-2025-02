import { model, models, Schema } from "mongoose"

export interface IPokemonInfo {
  spriteUrl: string
  audioUrl: string
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
}

export interface IPokemon {
  _id?: string
  name: string
  info?: IPokemonInfo
}

const PokemonInfoSchema = new Schema<IPokemonInfo>({
  spriteUrl: { type: String, },
  audioUrl: { type: String, },
  hp: { type: Number, },
  attack: { type: Number, },
  defense: { type: Number, },
  specialAttack: { type: Number, },
  specialDefense: { type: Number, },
})

const PokemonSchema = new Schema<IPokemon>({
  name: { type: String, required: true, unique: true },
  info: {type: PokemonInfoSchema}
})

const Pokemon = models.Pokemon || model("Pokemon", PokemonSchema)

export async function insertPokemon(data: IPokemon): Promise<IPokemon> {
  try {
    const newRecord = await Pokemon.create(data);
    return newRecord;
  } catch (error) {
    throw new Error(`Insert pokemon error: ${error}`);
  }
}

export async function upsertPokemon(data: IPokemon): Promise<IPokemon> {
  try {
    const record = await Pokemon.findOneAndUpdate({ name: data.name }, data, {
      upsert: true,
      new: true,
    });
    return record as IPokemon;
  } catch (error) {
    throw new Error(`Upsert pokemon error: ${error}`);
  }
}

export async function deletePokemon(id: string): Promise<IPokemon | null> {
  try {
    const record = await Pokemon.findByIdAndDelete(id);
    return record;
  } catch (error) {
    throw new Error(`Delete pokemon error: ${error}`);
  }
}

export async function findPokemonByName(name: string): Promise<IPokemon | null> {
  try {
    const record = await Pokemon.findOne({ name: name });
    return record;
  } catch (error) {
    throw new Error(`Find pokemon by name error: ${error}`);
  }
}

export async function findManyPokemonsByName(namePart: string, page: number = 1, limit: number = 10): Promise<IPokemon[]> {
  try {
    const skip = (page - 1) * limit;
    
    const records = await Pokemon.find({ 
      name: { $regex: namePart, $options: 'i' } 
    })
    .skip(skip)
    .limit(limit);

    return records;
  } catch (error) {
    throw new Error(`Find many pokemons by name error: ${error}`);
  }
}

export async function findAllPokemons(page: number = 1, limit: number = 10): Promise<IPokemon[]> {
  try {
    const skip = (page - 1) * limit;
    
    const records = await Pokemon.find({})
      .skip(skip)
      .limit(limit);
      
    return records;
  } catch (error) {
    throw new Error(`Find all pokemons error: ${error}`);
  }
}