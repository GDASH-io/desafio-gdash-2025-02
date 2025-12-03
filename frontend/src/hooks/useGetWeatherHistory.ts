import { getWeatherHistory } from "@/services/getWeatherHistory";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetWeatherHistory = () => {
  return useQuery({
    queryKey: ["weatherDataHistory"],
    queryFn: async () => {
      try {
        const data = await getWeatherHistory();

        return data ?? [];
      } catch (error) {
        toast.error("nao foi possivel retornar os dados");
        throw error;
      }
    },
    refetchInterval: 60000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
