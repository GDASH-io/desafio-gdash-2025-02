export type Starship = {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  hyperdrive_rating: string;
  MGLT: string;
  starship_class: string;
  url: string; // Usaremos isso para extrair o ID
};

export type SwapiResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
