// src/lib/externalApi.ts
export type Launch = {
  id: string;
  name: string;
  date_utc: string;
  flight_number?: number;
  details?: string | null;
  rocket?: string | null;
  upcoming?: boolean;
  success?: boolean | null;
  links?: {
    patch?: {
      small?: string | null;
      large?: string | null;
    };
  };
  failures?: Array<{
    time: number;
    altitude?: number | null;
    reason: string;
  }>;
  
};


export type Paginated<T> = {
  docs: T[];
  page: number | string;
  limit: number | string;
  total?: number;
  totalPages?: number;
};

export async function getSpaceXLaunches(page = 1, limit = 10): Promise<Paginated<Launch>> {
  const res = await fetch(`http://localhost:3000/api/external/spacex/launches?page=${page}&limit=${limit}`);
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(text || `Erro ${res.status}`);
  }
  return res.json();
}

export async function getSpaceXLaunchById(id: string): Promise<Launch> {
  const res = await fetch(`http://localhost:3000/api/external/spacex/launches/${id}`);
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(text || `Erro ${res.status}`);
  }
  return res.json();
}