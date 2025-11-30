import { api } from "@/lib/api";
import type { SwapiResponse, Starship } from "@/types/starWarsType";

export const starWarsService = {
  // Lista paginada
  async getStarships(page: number = 1): Promise<SwapiResponse<Starship>> {
    const { data } = await api.get<SwapiResponse<Starship>>(
      `/star-wars/starships`,
      {
        params: { page },
      }
    );
    return data;
  },

  // Detalhes individuais
  async getStarshipById(id: string): Promise<Starship> {
    const { data } = await api.get<Starship>(`/star-wars/starships/${id}`);
    return data;
  },
};
