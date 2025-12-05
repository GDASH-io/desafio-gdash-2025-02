import { api } from "@/api/api";
import { weatherDataAtom } from "@/atom/store";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { toast } from "sonner";

export function useWeatherData() {

  const [weatherData, setWeatherData] = useAtom(weatherDataAtom)

  const req = useQuery({
    queryKey: ["weather"],
    queryFn: async () => {
      return await api.get("/weather");
    },
    staleTime: 1000 * 60 * 30
  })

  async function fetchWeather() {
    try {
      const res = await req.refetch();
      if (res.status === "success") {
        const { message } = res.data.data;
        setWeatherData(message)
        return true
      } else {
        toast.error("Falha ao buscar pelos dados do clima");
        console.error(res);
        return false;
      }
    } catch(err) {
      console.error(err);
      toast.error("Falha ao buscar pelos dados do clima");
      return false;
    }
  }

  return { weatherData, fetchWeather };

}