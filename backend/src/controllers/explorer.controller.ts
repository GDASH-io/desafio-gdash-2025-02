// explorer.controller.ts
import { Controller, Get, Query, Param } from "@nestjs/common";
import { ExplorerService } from "../services/explorer.service";

@Controller("explorer")
export class ExplorerController {
  constructor(private explorer: ExplorerService) {}

  // GET /explorer/pokemons?page=1&limit=10
  @Get("pokemons")
  async getPokemons(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    return this.explorer.getPokemons(page, limit);
  }

  // GET /explorer/pokemons/:name
  @Get("pokemons/:name")
  async getPokemonDetails(@Param("name") name: string) {
    return this.explorer.getPokemonDetails(name);
  }
}
