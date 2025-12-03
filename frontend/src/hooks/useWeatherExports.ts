import { useState, useCallback } from 'react';
import { exportCsv, exportXlsx } from '../services/api';
import { useToast } from './use-toast';

/**
 * Hook para gerenciar lógica de exportação de dados climáticos
 */
export function useWeatherExports() {
  const [exporting, setExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExportCsv = useCallback(async () => {
    try {
      setExporting('csv');
      const blob = await exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weather-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Sucesso',
        description: 'Arquivo CSV exportado com sucesso!',
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao exportar CSV',
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  }, [toast]);

  const handleExportXlsx = useCallback(async () => {
    try {
      setExporting('xlsx');
      const blob = await exportXlsx();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weather-export.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Sucesso',
        description: 'Arquivo XLSX exportado com sucesso!',
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao exportar XLSX',
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  }, [toast]);

  return {
    exporting,
    handleExportCsv,
    handleExportXlsx,
  };
}

