import { useState, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";

interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  height: number;
  weight: number;
  url: string;
}

interface PokemonDetails extends Pokemon {
  abilities: string[];
  stats: { name: string; value: number }[];
  moves: string[];
}

interface PaginatedResponse {
  data: Pokemon[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Garante que a URL tenha um protocolo válido (http:// ou https://).
 */
function ensureProtocol(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  
  const localHosts = ['localhost', '127.0.0.1', 'backend:'];
  if (localHosts.some(host => trimmed.startsWith(host))) return `http://${trimmed}`;
  if (trimmed.startsWith('backend') && !trimmed.includes('.')) return `http://${trimmed}`;
  
  return `https://${trimmed}`;
}

// @ts-ignore
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = ensureProtocol(rawApiUrl);

async function authenticatedFetch(url: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Erro HTTP! status: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // Se não conseguir parsear, usar a mensagem padrão
    }
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
}

export default function Pokemon() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); // Termo de busca ativo
  const { toast } = useToast();

  useEffect(() => {
    fetchPokemon();
  }, [page, limit, activeSearch]);

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      const searchParam = activeSearch.trim() ? `&search=${encodeURIComponent(activeSearch.trim())}` : '';
      const data = await authenticatedFetch(
        `${API_BASE_URL}/pokemon?page=${page}&limit=${limit}${searchParam}`
      );
      setPokemonList(data.data);
      setPagination(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar Pokémon";
      const status = (error as any)?.status;
      if (status === 429 || errorMessage.includes("429") || errorMessage.includes("Muitas requisições")) {
        toast({
          title: "Muitas requisições",
          description: "Por favor, aguarde um momento antes de pesquisar novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPokemonDetails = async (id: number) => {
    try {
      const data = await authenticatedFetch(`${API_BASE_URL}/pokemon/${id}`);
      setSelectedPokemon(data);
      setShowDetails(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao buscar detalhes",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    setGoToPageInput("");
  };

  const handleSearch = () => {
    setActiveSearch(searchName);
    setPage(1); // Resetar para página 1 ao pesquisar
    setGoToPageInput("");
  };

  const handleClearSearch = () => {
    setSearchName("");
    setActiveSearch("");
    setPage(1);
    setGoToPageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPageInput, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      toast({
        title: "Erro",
        description: "Por favor, digite um número de página válido (maior que 0)",
        variant: "destructive",
      });
      return;
    }
    
    if (pagination && pageNumber > pagination.totalPages) {
      toast({
        title: "Erro",
        description: `A página ${pageNumber} não existe. Total de páginas: ${pagination.totalPages}`,
        variant: "destructive",
      });
      return;
    }
    
    setPage(pageNumber);
    setGoToPageInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Pokémon</h1>

        <div className="mb-6">
          <Label htmlFor="search-pokemon" className="text-sm font-medium text-foreground mb-2 block">
            Pesquisar por nome:
          </Label>
          <div className="flex gap-2 max-w-md">
            <Input
              id="search-pokemon"
              type="text"
              placeholder="Digite o nome do Pokémon..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} size="default">
              Pesquisar
            </Button>
            {activeSearch && (
              <Button onClick={handleClearSearch} variant="outline" size="default">
                Limpar
              </Button>
            )}
          </div>
          {activeSearch && (
            <p className="text-sm text-muted-foreground mt-2">
              Pesquisando por: <span className="font-semibold">{activeSearch}</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <>
            {activeSearch.trim() && pokemonList.length === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg mb-4">
                Nenhum Pokémon encontrado com o nome "{activeSearch}"
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {pokemonList.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className="bg-card border border-border rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
                  onClick={() => fetchPokemonDetails(pokemon.id)}
                >
                  <div className="text-center">
                    <img
                      src={pokemon.image}
                      alt={pokemon.name}
                      className="mx-auto mb-2"
                      style={{ width: '96px', height: '96px' }}
                    />
                    <p className="text-sm text-muted-foreground mb-1">#{pokemon.id}</p>
                    <h3 className="font-bold text-lg capitalize text-foreground">{pokemon.name}</h3>
                    <div className="flex gap-2 justify-center mt-2">
                      {pokemon.types.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs capitalize"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Altura: {pokemon.height / 10}m | Peso: {pokemon.weight / 10}kg
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {pagination && (
              <div className="bg-card border border-border rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                      {pagination.total} registros
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-foreground">Itens por página:</label>
                      <select
                        className="px-3 py-1 border border-input bg-background rounded-md text-sm text-foreground"
                        value={limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                  {pagination.totalPages > 1 && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        size="sm"
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-muted-foreground px-2 flex items-center">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        size="sm"
                      >
                        Próxima
                      </Button>
                      <div className="flex items-center gap-2 ml-4">
                        <Label htmlFor="go-to-page-pokemon" className="text-sm whitespace-nowrap">
                          Ir para:
                        </Label>
                        <Input
                          id="go-to-page-pokemon"
                          type="number"
                          min="1"
                          max={pagination.totalPages}
                          value={goToPageInput}
                          onChange={(e) => setGoToPageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleGoToPage();
                            }
                          }}
                          placeholder="Página"
                          className="w-20 h-8 text-sm"
                        />
                        <Button
                          variant="outline"
                          onClick={handleGoToPage}
                          size="sm"
                          className="h-8"
                        >
                          Ir
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {showDetails && selectedPokemon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">#{selectedPokemon.id}</p>
                  <h2 className="text-2xl font-bold capitalize text-foreground">{selectedPokemon.name}</h2>
                </div>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <img
                    src={selectedPokemon.image}
                    alt={selectedPokemon.name}
                    className="mx-auto"
                    style={{ width: '200px', height: '200px' }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Informações</h3>
                  <p className="text-muted-foreground">Altura: {selectedPokemon.height / 10}m</p>
                  <p className="text-muted-foreground">Peso: {selectedPokemon.weight / 10}kg</p>
                  <p className="mt-2 text-muted-foreground">
                    Tipos: {selectedPokemon.types.map((t) => t).join(", ")}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Habilidades: {selectedPokemon.abilities.join(", ")}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-foreground">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPokemon.stats.map((stat) => (
                    <div key={stat.name} className="flex justify-between">
                      <span className="capitalize text-foreground">{stat.name}:</span>
                      <span className="font-semibold text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-foreground">Movimentos (primeiros 10)</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPokemon.moves.map((move) => (
                    <span
                      key={move}
                      className="px-2 py-1 bg-muted rounded text-sm capitalize text-foreground"
                    >
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

