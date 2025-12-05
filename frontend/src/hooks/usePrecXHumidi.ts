import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export function usePrecXHumidi() {
  const req = useQuery({
    queryKey: ["precXHumidi"],
    queryFn: async () => {
      const res = await api.get("/weather/lastweek/precxhumid");
      return res.data?.message
    },
    staleTime: 1000 * 60 * 30
  });

  return { precXHumidi: req.data, isLoading: req.isLoading, isError: req.isError, refetch: req.refetch }
}