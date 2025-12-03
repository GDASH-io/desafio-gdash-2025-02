import { useQuery } from "@tanstack/react-query";
import type { ClimateResponse } from "../components/table-dashboad";
import { handleDataTable } from "./data-table";

export function useClimates(page: number) {
  return useQuery<ClimateResponse>({
    queryKey: ["climates", page],
    queryFn: () => handleDataTable(page),
  });
}
