import axios from "axios";
import type { StarWarsPeopleResponse } from "@/interfaces/starWars";

const starWarsApi = axios.create({
  baseURL: "https://swapi.dev/api",
});

export async function listPeople(page: number = 1): Promise<StarWarsPeopleResponse> {
  const { data } = await starWarsApi.get<StarWarsPeopleResponse>("/people/", {
    params: { page },
  });
  return data;
}

export const starWarsService = {
  listPeople,
};
