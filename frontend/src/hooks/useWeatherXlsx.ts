import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function useWeatherXlsx() {
  const req = useQuery({
    queryKey: ["weatherxlsx"],
    queryFn: async () => {
      return await api.get("/weather/xlsx")
    },
    staleTime: 1000 * 60 * 30
  });

  async function handleWeatherDownload(tries = 3) {
    if (req.isSuccess) {
      const res = req.data;
      const message = res.data.message

      const bynary = atob(message);
      const bytes = new Uint8Array(bynary.length);
      for (let i = 0; i < bynary.length; i++) {
        bytes[i] = bynary.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clima.xlsx";
      a.click();
      URL.revokeObjectURL(url);

    } else {
      if (tries > 0) {
        toast.error("Falha em gerar planilha, tentando novamente....");
        await req.refetch()
        setTimeout(() => handleWeatherDownload(tries - 1), 2000)
      } else {
        toast.error("Tentativas de gerar planilha excedidas")
      }
    }
  }

  return handleWeatherDownload
}