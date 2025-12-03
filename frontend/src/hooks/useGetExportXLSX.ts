import { getExportXLSX } from "@/services/getExportXLSX";
import { useMutation } from "@tanstack/react-query";

export const useExportXLSX = () => {
  return useMutation({
    mutationFn: getExportXLSX,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "weather-data.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    onError: () => {
      console.error("Erro ao exportar XLSX");
    },
  });
};
