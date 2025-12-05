import * as React from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface IUseExport {
  handleExport: (format: "csv" | "xlsx") => Promise<void>;
  isExporting: boolean;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const useExport = (): IUseExport => {
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = React.useCallback(
    async (format: "csv" | "xlsx") => {
      if (!token) {
        toast({
          title: "Erro de Autenticação",
          description: "Sessão expirada. Faça login novamente.",
          variant: "destructive",
        });
        logout();
        return;
      }

      setIsExporting(true);
      const exportUrl = `/weather/export/${format}`;

      try {
        const response = await fetch(API_BASE_URL + exportUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          logout();
          throw new Error("Sessão inválida.");
        }

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Erro ${response.status}: Falha na exportação.`;
          if (errorText.includes("Nenhum dado encontrado")) {
            errorMessage = "Nenhum dado encontrado para exportação.";
          }
          throw new Error(errorMessage);
        }
        const blob = await response.blob();
        const filenameHeader = response.headers.get("Content-Disposition");
        const filename =
          filenameHeader?.split("filename=")[1]?.replace(/"/g, "") ||
          `weather_logs_${Date.now()}.${format}`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Exportação Concluída",
          description: `O arquivo ${filename} foi baixado com sucesso.`,
        });
      } catch (error) {
        const message =
          (error as Error).message ||
          "Erro desconhecido ao realizar o download.";
        toast({
          title: "Falha na Exportação",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsExporting(false);
      }
    },
    [token, toast, logout]
  );

  return { handleExport, isExporting };
};
