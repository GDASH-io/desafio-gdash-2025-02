import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokemonService {
  async findAll(page: number = 1) {
    const limit = 20;
    const offset = (page - 1) * limit;

    // CORREÇÃO: Adicionado <any> para dizer que o retorno é dinâmico
    const response = await axios.get<any>(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`,
    );

    const resultsWithImages = response.data.results.map((pokemon: any) => {
      const parts = pokemon.url.split('/');
      const id = parts[parts.length - 2];

      return {
        name: pokemon.name,
        url: pokemon.url,
        id: id,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      };
    });

    return {
      results: resultsWithImages,
      count: response.data.count,
      page: Number(page),
      totalPages: Math.ceil(response.data.count / limit),
    };
  }

  async findOne(name: string) {
    // CORREÇÃO: Adicionado <any>
    const response = await axios.get<any>(
      `https://pokeapi.co/api/v2/pokemon/${name}`,
    );
    return {
      name: response.data.name,
      image: response.data.sprites.other['official-artwork'].front_default,

      types: response.data.types.map((t: any) => t.type.name),
    };
  }
}
