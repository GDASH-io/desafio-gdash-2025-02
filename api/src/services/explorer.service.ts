// explorer.service.ts
import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ExplorerService {
  constructor(private http: HttpService) {}

  async getPokemons(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    const response = await firstValueFrom(this.http.get(url));
    return response.data;
  }

  async getPokemonDetails(name: string) {
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    const response = await firstValueFrom(this.http.get(url));
    return response.data;
  }
}
