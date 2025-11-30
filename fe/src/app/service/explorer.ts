import { httpClient } from "./httpClient";

export class ExplorerService {
  static async findAll(page_param: number = 0, signal?: AbortSignal) {
    const page = page_param > 0 ? page_param : 0;
    const { data, status } =
      await httpClient.get<ExplorerService.GetPokemonsOutput>(
        `/explorer/star-wars?page=${page}`,
        { signal }
      );

    return status === 200 ? data : undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ExplorerService {
  export type GetPokemonsOutput = {
    data: {
        name: string;
        height: string;
        mass: string;
        hair_color: string;
        skin_color: string;
        eye_color: string;
      }[];
    has_next: boolean;
    total_pages: number;
  };
}
