import * as React from "react";
import { Download, FileText, Sheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "csv" | "xlsx") => void;
  isExporting: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isExporting,
}) => {
  const { toast } = useToast();
  const handleDownload = async (format: "csv" | "xlsx") => {
    try {
      await onExport(format);
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Falha na Transmissão",
        description: "Não foi possível iniciar o download. Verifique os logs.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#28364F] flex items-center">
            <Download className="mr-2 h-6 w-6 text-[#50E3D2]" />
            Exportar Logs de Clima
          </DialogTitle>
          <DialogDescription>
            Selecione o formato de arquivo desejado para baixar todos os
            registros históricos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 pt-4">
          <Button
            variant="default"
            className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleDownload("csv")}
            disabled={isExporting}
          >
            <FileText className="mr-2 h-4 w-4" /> Baixar em CSV
          </Button>
          <Button
            variant="default"
            className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => handleDownload("xlsx")}
            disabled={isExporting}
          >
            <Sheet className="mr-2 h-4 w-4" /> Baixar em XLSX (Excel)
          </Button>
        </div>

        {isExporting && (
          <p className="text-sm text-center text-gray-500 mt-3">
            Preparando download...
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
