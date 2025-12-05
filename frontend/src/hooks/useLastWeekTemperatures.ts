import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export function useLastWeekTemperatures() {

  const req = useQuery({
    queryKey: ["lastWeekTemperatures"],
    queryFn: async () => {
      const res = await api.get("/weather/lastweek/temperatures");
      return res.data?.message
    },
    staleTime: 1000 * 60 * 30
  });

  return { lastWeekTemperatures: req.data, isLoading: req.isLoading, isError: req.isError, refetch: req.refetch }
}