import { getWeather } from "@/services/getWeather";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetWeather = () => {
  return useQuery({
    queryKey: ["weatherData"],
    queryFn: async () => {
      try {
        const data = await getWeather();

        return data ?? {};
      } catch (error) {
        toast.error("nao foi possivel retornar os dados");
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 60 * 1000,
  });
};
