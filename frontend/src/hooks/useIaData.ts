import { api } from "@/api/api";
import { IaDataAtom } from "@/atom/store";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "sonner";

export function useIaData() {
  const [iaData, setIaData] = useAtom(IaDataAtom);

  const req = useQuery({
    queryKey: ["iaData"],
    queryFn: async () => {
      return await api.get("weather/insights")
    },
    staleTime: 1000 * 60 * 30
  })

  useEffect(() => {
    if(req.isSuccess && req.data.data.message) {
      setIaData(req.data.data.message)
    }
  }, [req.data, req.isSuccess, setIaData]);

  async function askForIaAnalysis() {
    try {
      const res = await req.refetch();
      console.log(res)
      if(res.status === "success") {
        setIaData(res.data?.data.message)
        return true;
      } else {
        console.error(res)
        toast.error("Falha ao solicitar análise");
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha ao solicitar análise");
      return false;
    }
  }

  return { iaData, askForIaAnalysis, isLoading: req.isFetching }
}