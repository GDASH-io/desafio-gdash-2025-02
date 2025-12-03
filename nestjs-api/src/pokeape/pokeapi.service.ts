import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokeapiService {
	async getPokemonList(limit = 20, offset = 0) {
		try {
			const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
			return res.data;
		} catch (err) {
			throw new HttpException('Falha ao conectar com PokéAPI', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}