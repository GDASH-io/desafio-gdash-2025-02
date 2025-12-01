export interface StarWarsPerson {
  name: string;
  height: string;
  mass: string;
  gender: string;
  birth_year: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  url: string;
}

export interface StarWarsPeopleResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StarWarsPerson[];
}
