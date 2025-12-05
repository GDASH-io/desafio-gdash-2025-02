export interface ISwapiPerson {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  url: string;
}

export interface ISwapiPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ISwapiPerson[];
}

export interface ISwapiContext {
  people: ISwapiPerson[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  fetchPeople: (page: number) => Promise<void>;
}
