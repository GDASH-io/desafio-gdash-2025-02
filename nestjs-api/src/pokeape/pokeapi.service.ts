import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokeapiService {
	async getPokemonList(limit: number = 20, offset: number = 0) {
		try {
			const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
			
			const enriched = await Promise.all(
				res.data.results.map(async (pokemon: any) => {
					try {
						const detail = await axios.get(pokemon.url);
						return {
							name: pokemon.name,
							url: pokemon.url,
							id: detail.data.id,
							image: detail.data.sprites.other['official-artwork'].front_default || detail.data.sprites.front_default,
							types: detail.data.types.map((t: any) => t.type.name),
							height: detail.data.height / 10,
							weight: detail.data.weight / 10,
						};
					} catch {
						return { name: pokemon.name, url: pokemon.url, id: 0, image: null, types: [], height: 0, weight: 0 };
					}
				})
			);
			
			return { ...res.data, results: enriched };
		} catch (err) {
			throw new HttpException('Falha ao conectar com PokéAPI', HttpStatus.SERVICE_UNAVAILABLE);
		}
	}
}