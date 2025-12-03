import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download } from 'lucide-react';
import { WeatherLog } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { weatherService } from '@/services/weather.service';
import { useToast } from '@/components/ui/use-toast';

interface WeatherTableProps {
  data: WeatherLog[];
}

export function WeatherTable({ data }: WeatherTableProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const formatCondition = (condition: string): string => {
    const conditions: Record<string, string> = {
      clear: 'Sol',
      mainly_clear: 'Sol',
      partly_cloudy: 'Nublado',
      overcast: 'Nublado',
      rainy: 'Chuva',
      thunderstorm: 'Tempestade',
    };
    return conditions[condition] || condition;
  };

  async function handleExport(type: 'csv' | 'xlsx') {
    setExportLoading(true);
    try {
      const blob = type === 'csv'
        ? await weatherService.exportCSV()
        : await weatherService.exportXLSX();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-data.${type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Exportação concluída',
        description: `Arquivo ${type.toUpperCase()} baixado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Histórico de Registros</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('xlsx')}
              disabled={exportLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              XLSX
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead className="text-right">Temp</TableHead>
                <TableHead className="text-right">Umidade</TableHead>
                <TableHead className="text-right">Vento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    {format(new Date(log.timestamp), "dd/MM HH'h'mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{log.location.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatCondition(log.condition)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{log.temperature}°C</TableCell>
                  <TableCell className="text-right">{log.humidity}%</TableCell>
                  <TableCell className="text-right">{log.windSpeed}km/h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'bg-primary' : ''}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}