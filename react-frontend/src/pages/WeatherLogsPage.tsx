import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { parseISO, format } from 'date-fns';
import { Download, RefreshCw, Trash2, Sun, Moon, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import CitySelector from '@/components/weather/CitySelector';

interface WeatherLog {
  _id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
  humidity?: number;
  precipitation_probability?: number;
  city?: string;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const weatherCodeMap: { [key: number]: string } = {
  0: 'Céu limpo',
  1: 'Principalmente claro',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Névoa',
  48: 'Névoa com geada',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  56: 'Garoa congelante leve',
  57: 'Garoa congelante intensa',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva intensa',
  66: 'Chuva congelante leve',
  67: 'Chuva congelante intensa',
  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve intensa',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva violentas',
  85: 'Pancadas de neve leves',
  86: 'Pancadas de neve intensas',
  95: 'Tempestade leve ou moderada',
  96: 'Tempestade com granizo leve',
  99: 'Tempestade com granizo intenso',
};

type SortField = 'timestamp' | 'temperature' | 'humidity' | 'windspeed' | 'weathercode' | 'precipitation_probability';
type SortDirection = 'asc' | 'desc';

export function WeatherLogsPage() {
  const [weatherLogs, setWeatherLogs] = useState<WeatherLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);
  
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const savedLocation = localStorage.getItem('current_location');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        if (location.city) {
          setSelectedCity(location.city);
        }
      } catch (err) {
        console.error('Erro ao carregar localização do localStorage:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchWeatherLogs();
    }
  }, [selectedCity]);

  useEffect(() => {
    let filtered = [...weatherLogs];

    if (selectedCity) {
      filtered = filtered.filter(log => log.city === selectedCity);
    }

    applySortAndSet(filtered);
  }, [weatherLogs, selectedCity, sortField, sortDirection]);

  const applySortAndSet = (logs: WeatherLog[]) => {
    const sorted = [...logs].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'timestamp') {
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
      }

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    setFilteredLogs(sorted);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const fetchWeatherLogs = async () => {
    if (!selectedCity) {
      setWeatherLogs([]);
      setFilteredLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const logsResponse = await axios.get(`${API_BASE_URL}/api/weather/logs?city=${encodeURIComponent(selectedCity)}`);
      setWeatherLogs(logsResponse.data);
    } catch (err) {
      setError('Falha ao buscar dados de clima.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCity) {
      alert('Selecione uma cidade primeiro');
      return;
    }

    setUpdating(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/weather/logs/update?city=${encodeURIComponent(selectedCity)}`
      );
      await fetchWeatherLogs();
      const message = response.data.count 
        ? `${response.data.count} log(s) criado(s) com sucesso!`
        : 'Log atualizado com sucesso!';
      alert(message);
    } catch (err: any) {
      console.error('Erro ao atualizar log:', err);
      alert(err?.response?.data?.message || 'Falha ao atualizar log.');
    } finally {
      setUpdating(false);
    }
  };

  const handleClear = async () => {
    if (!selectedCity) {
      alert('Selecione uma cidade primeiro');
      return;
    }

    if (!confirm(`Tem certeza que deseja limpar todos os logs de ${selectedCity}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setClearing(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/weather/logs?city=${encodeURIComponent(selectedCity)}`);
      await fetchWeatherLogs();
      alert('Logs limpos com sucesso!');
    } catch (err: any) {
      console.error('Erro ao limpar logs:', err);
      alert(err?.response?.data?.message || 'Falha ao limpar logs.');
    } finally {
      setClearing(false);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      let requestUrl = `${API_BASE_URL}/api/weather/export.${format}`;
      if (selectedCity) {
        requestUrl += `?city=${encodeURIComponent(selectedCity)}`;
      }

      const response = await axios.get(requestUrl, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weather_logs.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Falha ao exportar ${format}:`, err);
      alert(`Falha ao exportar ${format}.`);
    }
  };

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  if (loading) return <p className="text-[#E5E7EB] p-4">Carregando histórico de clima...</p>;
  if (error) return <p className="text-red-500 p-4">Erro: {error}</p>;

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-[#E5E7EB]">Histórico de Logs de Clima</h2>
        <p className="text-sm text-[#9CA3AF]">Registros coletados automaticamente pela IA ao longo do dia.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-4 bg-[#161B22] border border-[#1F2937] rounded-lg">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="flex items-center gap-2 min-w-[200px]">
            <CitySelector
              selectedCity={selectedCity}
              onCityChange={(city) => {
                setSelectedCity(city);
                localStorage.setItem('current_location', JSON.stringify({ city }));
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            size="sm"
            className="h-9 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] hover:bg-[#161B22]"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            onClick={() => handleExport('xlsx')}
            variant="outline"
            size="sm"
            className="h-9 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] hover:bg-[#161B22]"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar XLSX
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            disabled={clearing || !selectedCity}
            className="h-9 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] hover:bg-[#161B22] disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {clearing ? 'Limpando...' : 'Limpar logs'}
          </Button>
          <Button
            onClick={handleUpdate}
            variant="outline"
            size="sm"
            disabled={updating || !selectedCity}
            className="h-9 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] hover:bg-[#161B22] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
            {updating ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-[#1F2937] bg-[#161B22] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1F2937] hover:bg-[#1F2937]/50">
                <TableHead
                  className="text-[#E5E7EB] text-xs font-medium cursor-pointer hover:text-[#3B82F6] transition-colors"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center">
                    Carimbo de Tempo
                    <SortIcon field="timestamp" />
                  </div>
                </TableHead>
                <TableHead className="text-[#E5E7EB] text-xs font-medium">Local</TableHead>
                <TableHead
                  className="text-[#E5E7EB] text-xs font-medium cursor-pointer hover:text-[#3B82F6] transition-colors"
                  onClick={() => handleSort('temperature')}
                >
                  <div className="flex items-center">
                    Temp (°C)
                    <SortIcon field="temperature" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-[#E5E7EB] text-xs font-medium cursor-pointer hover:text-[#3B82F6] transition-colors"
                  onClick={() => handleSort('humidity')}
                >
                  <div className="flex items-center">
                    Umidade (%)
                    <SortIcon field="humidity" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-[#E5E7EB] text-xs font-medium cursor-pointer hover:text-[#3B82F6] transition-colors"
                  onClick={() => handleSort('windspeed')}
                >
                  <div className="flex items-center">
                    Vento (km/h)
                    <SortIcon field="windspeed" />
                  </div>
                </TableHead>
                <TableHead className="text-[#E5E7EB] text-xs font-medium">
                  <div className="flex items-center gap-1">
                    Código
                    <div className="group relative">
                      <HelpCircle className="h-3.5 w-3.5 text-[#9CA3AF] cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-2 bg-[#0D1117] border border-[#1F2937] rounded text-xs text-[#E5E7EB] shadow-lg">
                        <div className="font-medium mb-1">Códigos de Clima:</div>
                        <div className="space-y-0.5 max-h-48 overflow-y-auto">
                          {Object.entries(weatherCodeMap).slice(0, 10).map(([code, desc]) => (
                            <div key={code}><span className="font-mono">{code}</span> — {desc}</div>
                          ))}
                          <div className="text-[#9CA3AF] mt-1">... e mais</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-[#E5E7EB] text-xs font-medium">Dia</TableHead>
                <TableHead
                  className="text-[#E5E7EB] text-xs font-medium cursor-pointer hover:text-[#3B82F6] transition-colors"
                  onClick={() => handleSort('precipitation_probability')}
                >
                  <div className="flex items-center">
                    Prob (%)
                    <SortIcon field="precipitation_probability" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-[#9CA3AF] py-8">
                    Nenhum log encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log, index) => (
                  <TableRow
                    key={log._id}
                    className={`border-[#1F2937] hover:bg-[#1F2937]/50 ${
                      index % 2 === 0 ? 'bg-[#161B22]' : 'bg-[#0D1117]'
                    }`}
                  >
                    <TableCell className="text-[#E5E7EB] text-xs text-left">
                      {format(parseISO(log.timestamp), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-[#E5E7EB] text-xs font-medium">
                      {log.city || 'N/A'}
                    </TableCell>
                    <TableCell className="text-[#E5E7EB] text-xs">{log.temperature.toFixed(1)}</TableCell>
                    <TableCell className="text-[#E5E7EB] text-xs">{log.humidity ?? 'N/A'}</TableCell>
                    <TableCell className="text-[#E5E7EB] text-xs">{log.windspeed.toFixed(1)}</TableCell>
                    <TableCell className="text-[#E5E7EB] text-xs">
                      <div className="group relative inline-block">
                        <span className="font-mono">{log.weathercode}</span>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-48 p-2 bg-[#0D1117] border border-[#1F2937] rounded text-xs text-[#E5E7EB] shadow-lg">
                          {weatherCodeMap[log.weathercode] || 'Desconhecido'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#E5E7EB] text-xs">
                      {log.is_day === 1 ? (
                        <Sun className="h-4 w-4 text-yellow-500 inline" />
                      ) : log.is_day === 0 ? (
                        <Moon className="h-4 w-4 text-blue-400 inline" />
                      ) : (
                        <span className="text-[#9CA3AF]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#E5E7EB] text-xs">{log.precipitation_probability ?? 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-[#9CA3AF]">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length} registros
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="h-8 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] hover:bg-[#161B22] disabled:opacity-50"
            >
              &lt;
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  className={`h-8 ${
                    currentPage === pageNum
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] hover:bg-[#161B22]'
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="h-8 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] hover:bg-[#161B22] disabled:opacity-50"
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
