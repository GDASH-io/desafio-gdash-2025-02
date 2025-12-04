import { Controller, Get, Query } from '@nestjs/common';
import fetch from 'node-fetch';

@Controller('pokemon')
export class PokemonController {
  @Get()
  async getPokemons(@Query('page') page = 1) {
    const limit = 20;
    const offset = (Number(page) - 1) * limit;

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await res.json();

    return {
      count: data.count,
      next: data.next,
      previous: data.previous,
      results: data.results,
    };
  }

  @Get('detail')
  async getPokemonDetail(@Query('url') url: string) {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }
}
