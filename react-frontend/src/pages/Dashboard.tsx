import { useEffect, useState } from 'react';
import { Thermometer, BarChart3, LineChart, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';


interface Pokemon {
  name: string;
  url: string;
}

interface PokemonTypeResponse {
  pokemon: {
    pokemon: Pokemon;
  }[];
}

interface PokemonDetails {
  sprites: {
    front_default: string;
  };
}

interface InsightsSuccessResponse {
  current: {
    temperature: number;
    classification: string;
  };
  analysis24h: {
    minTemperature: string;
    maxTemperature: string;
    avgTemperature: string;
  };
  summary: string;
}

interface InsightsErrorResponse {
  message: string;
}

type InsightsResponse = InsightsSuccessResponse | InsightsErrorResponse;

interface WeatherLog {
  _id: string;
  time: string;
  temperature: number;
  wind_speed: number;
}


export function Dashboard() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [weatherLogs, setWeatherLogs] = useState<WeatherLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //POKEMONS
  const [suggestedPokemons, setSuggestedPokemons] = useState<Pokemon[]>([]);
  const [isPokemonLoading, setIsPokemonLoading] = useState(false);
  const [pokemonSuggestion, setPokemonSuggestion] = useState({ title: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 5;

  
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const [insightsResponse, logsResponse] = await Promise.all([
          api.get<InsightsResponse>('/weather/insights'),
          api.get<WeatherLog[]>('/weather'),
        ]);
        setInsights(insightsResponse.data);
        setWeatherLogs(logsResponse.data);
      } catch (error) {
        toast.error('Não foi possível carregar os dados do dashboard.');
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

 //busca de pokemons
  useEffect(() => {
    const getPokemonSuggestion = (classification: string) => {
      switch (classification) {
        case 'Calor Intenso':
        case 'Dia Quente':
          return { type: 'fire', title: 'Pokémon Sugeridos de Acordo com o clima: FOGO' };
        case 'Dia Frio':
          return { type: 'ice', title: 'Pokémon Sugeridos de Acordo com o clima: GELO' };
        case 'Clima Agradável':
          return { type: 'normal', title: 'Pokémon Sugeridos de Acordo com o clima: NORMAL' };
        default:
          return { type: '', title: '' };
      }
    };

    //busca pokeapi
    const fetchSuggestedPokemons = async (pokemonType: string) => {
      if (!pokemonType) {
        setSuggestedPokemons([]);
        return;
      }
      
      setIsPokemonLoading(true);
      setCurrentPage(1); 

      try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${pokemonType}`);
        if (!response.ok) throw new Error('Falha na rede ao buscar Pokémon');
        
        const data: PokemonTypeResponse = await response.json();
        setSuggestedPokemons(data.pokemon.map(p => p.pokemon));
      } catch (error) {
        toast.error(`Não foi possível carregar Pokémon do tipo ${pokemonType}.`);
      } finally {
        setIsPokemonLoading(false);
      }
    };

    // Só roda a lógica se os insights já tiverem sido carregados
    if (insights && 'current' in insights) {
      const suggestion = getPokemonSuggestion(insights.current.classification);
      if (suggestion.type && suggestion.type !== pokemonSuggestion.type) {
        setPokemonSuggestion(suggestion);
        fetchSuggestedPokemons(suggestion.type);
      }
    }
  }, [insights, pokemonSuggestion.type]); 


  const hasSuccessData = (response: InsightsResponse | null): response is InsightsSuccessResponse => {
    return response !== null && 'current' in response;
  };

  // paginação pokemon
  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = suggestedPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);
  const totalPages = Math.ceil(suggestedPokemons.length / pokemonsPerPage);
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  // COmponente para o card pokemon
  const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    useEffect(() => {
      fetch(pokemon.url)
        .then(res => res.json())
        .then((data: PokemonDetails) => setImageUrl(data.sprites.front_default));
    }, [pokemon.url]);

    return (
      <div className="flex flex-col items-center justify-center p-2 border rounded-lg transition-transform hover:scale-105">
        {imageUrl ? (
          <img src={imageUrl} alt={pokemon.name} className="w-20 h-20" />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-md animate-pulse" />
        )}
        <p className="mt-2 text-sm font-medium capitalize">{pokemon.name}</p>
      </div>
    );
  };
  
  //exportar dados
  const handleExport = async (format: 'csv' | 'xlsx') => {
    const toastId = toast.loading(`Gerando arquivo ${format.toUpperCase()}...`);

    try {
      const response = await api.get(`/weather/export/${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const filename = `historico_clima.${format}`;
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Arquivo ${filename} baixado com sucesso!`, { id: toastId });

    } catch (error) {
      toast.error(`Falha ao exportar para ${format.toUpperCase()}.`, { id: toastId });
      console.error(`Erro ao exportar para ${format}:`, error);
    }
  };


  if (isLoading) {
    return <div className="text-center p-10">Carregando dashboard...</div>;
  }
  
  if (!hasSuccessData(insights)) {
    return <div className="text-center p-10">{insights?.message || 'Não foi possível carregar os insights.'}</div>;
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Clima</h1>
        <p className="text-muted-foreground">Análise em tempo real de Pernambuco</p>
      </div>
      
      {/* Insights*/}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
       
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperatura Atual</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.current.temperature}°C</div>
            <p className="text-xs text-muted-foreground">{insights.current.classification}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temp. Média (24h)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.analysis24h.avgTemperature}°C</div>
            <p className="text-xs text-muted-foreground">Média das últimas 24 horas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temp. Máxima (24h)</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.analysis24h.maxTemperature}°C</div>
            <p className="text-xs text-muted-foreground">Pico nas últimas 24 horas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temp. Mínima (24h)</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground -scale-y-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.analysis24h.minTemperature}°C</div>
            <p className="text-xs text-muted-foreground">Vale nas últimas 24 horas</p>
          </CardContent>
        </Card>
      </div>

      {/*RESUMO */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Inteligente</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{insights.summary}</p>
        </CardContent>
      </Card>
      
      {/* Pokemon card*/}
      {pokemonSuggestion.type && (
        <Card>
          <CardHeader>
            <CardTitle>{pokemonSuggestion.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Com base no <strong>"{insights.current.classification}"</strong>, sugerimos estes Pokémon do tipo <strong>{pokemonSuggestion.type}</strong>:
            </p>
          </CardHeader>
          <CardContent>
            {isPokemonLoading ? (
              <div className="text-center p-4">Procurando os melhores Pokémon...</div>
            ) : suggestedPokemons.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {currentPokemons.map((p) => <PokemonCard key={p.name} pokemon={p} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-6 gap-4">
                    <Button variant="outline" size="sm" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Anterior</Button>
                    <span className="text-sm font-medium">Página {currentPage} de {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Próxima</Button>
                  </div>
                )}
              </>
            ) : (
               <div className="text-center p-4 text-muted-foreground">Nenhum Pokémon encontrado para esta categoria.</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* HISTORICO */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Coletas Recentes</CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar XLSX
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário da Coleta</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Vento (km/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weatherLogs.length > 0 ? (
                weatherLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>{new Date(log.time).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{log.temperature}°C</TableCell>
                    <TableCell>{log.wind_speed}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Nenhum registro encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}