import { getWeatherInsights } from "@/services/getWeatherInsights";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetWeatherInsights = () => {
  return useQuery({
    queryKey: ["weatherInsightsData"],
    queryFn: async () => {
      try {
        const data = await getWeatherInsights();

        return data ?? {};
      } catch (error) {
        toast.error("nao foi possivel retornar os dados");

        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 6 * 60 * 60 * 1000,
  });
};
