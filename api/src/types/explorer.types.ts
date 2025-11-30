export type PublicApiResponse = {
  results: {
    name: string;
    height: string;
    mass: string;
    hair_color: string;
    skin_color: string;
    eye_color: string;
  }[];
  next: string | null;
  count: number;
};

export type ExplorerResult = {
  data: PublicApiResponse['results'];
  has_next: boolean;
  total_pages: number;
};
