import { useState, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";

type ResourceType = "people" | "planets" | "starships";

interface PaginatedResponse {
  data: any[];
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

export default function StarWars() {
  const [resourceType, setResourceType] = useState<ResourceType>("people");
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); // Termo de busca ativo
  const [resolvedNames, setResolvedNames] = useState<{
    homeworld?: string;
    films?: string[];
    vehicles?: string[];
    starships?: string[];
    residents?: string[];
    pilots?: string[];
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [resourceType, page, limit, activeSearch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const searchParam = activeSearch.trim() ? `&search=${encodeURIComponent(activeSearch.trim())}` : '';
      const response = await authenticatedFetch(
        `${API_BASE_URL}/starwars/${resourceType}?page=${page}&limit=${limit}${searchParam}`
      );
      setData(response.data);
      setPagination(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar dados";
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

  const fetchNameFromUrl = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return "N/A";
      }
      const data = await response.json();
      return data.name || data.title || "N/A";
    } catch {
      return "N/A";
    }
  };

  const fetchNamesFromUrls = async (urls: string[]): Promise<string[]> => {
    try {
      const promises = urls.map(url => fetchNameFromUrl(url));
      return await Promise.all(promises);
    } catch {
      return [];
    }
  };

  const fetchItemDetails = async (url: string) => {
    setLoadingDetails(true);
    setResolvedNames({});
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }
      const details = await response.json();
      setSelectedItem(details);

      // Buscar nomes para arrays e homeworld
      const resolved: any = {};

      // Homeworld (apenas para pessoas)
      if (details.homeworld) {
        resolved.homeworld = await fetchNameFromUrl(details.homeworld);
      }

      // Filmes
      if (details.films && Array.isArray(details.films) && details.films.length > 0) {
        resolved.films = await fetchNamesFromUrls(details.films);
      }

      // Veículos (apenas para pessoas)
      if (details.vehicles && Array.isArray(details.vehicles) && details.vehicles.length > 0) {
        resolved.vehicles = await fetchNamesFromUrls(details.vehicles);
      }

      // Naves (apenas para pessoas)
      if (details.starships && Array.isArray(details.starships) && details.starships.length > 0) {
        resolved.starships = await fetchNamesFromUrls(details.starships);
      }

      // Residentes (apenas para planetas)
      if (details.residents && Array.isArray(details.residents) && details.residents.length > 0) {
        resolved.residents = await fetchNamesFromUrls(details.residents);
      }

      // Pilotos (apenas para naves)
      if (details.pilots && Array.isArray(details.pilots) && details.pilots.length > 0) {
        resolved.pilots = await fetchNamesFromUrls(details.pilots);
      }

      setResolvedNames(resolved);
      setShowDetails(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao buscar detalhes",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderTable = () => {
    if (data.length === 0) return null;

    const headers = Object.keys(data[0]).filter((key) => key !== "url");
    const resourceLabels: Record<ResourceType, string> = {
      people: "Pessoas",
      planets: "Planetas",
      starships: "Naves",
    };

    return (
      <div className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{resourceLabels[resourceType]}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {header.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {data.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => item.url && fetchItemDetails(item.url)}
                >
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                    >
                      {item[header] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Star Wars</h1>

        <div className="mb-6">
          <Label htmlFor="search-starwars" className="text-sm font-medium text-foreground mb-2 block">
            Pesquisar por nome:
          </Label>
          <div className="flex gap-2 max-w-md mb-4">
            <Input
              id="search-starwars"
              type="text"
              placeholder="Digite o nome..."
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
            <p className="text-sm text-muted-foreground mb-4">
              Pesquisando por: <span className="font-semibold">{activeSearch}</span>
            </p>
          )}
        </div>

        <div className="mb-6 flex gap-2">
          <Button
            variant={resourceType === "people" ? "default" : "outline"}
            onClick={() => {
              setResourceType("people");
              setPage(1);
              setSearchName("");
              setActiveSearch("");
            }}
          >
            Pessoas
          </Button>
          <Button
            variant={resourceType === "planets" ? "default" : "outline"}
            onClick={() => {
              setResourceType("planets");
              setPage(1);
              setSearchName("");
              setActiveSearch("");
            }}
          >
            Planetas
          </Button>
          <Button
            variant={resourceType === "starships" ? "default" : "outline"}
            onClick={() => {
              setResourceType("starships");
              setPage(1);
              setSearchName("");
              setActiveSearch("");
            }}
          >
            Naves
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <>
            {activeSearch.trim() && data.length === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg mb-4">
                Nenhum resultado encontrado com o nome "{activeSearch}"
              </div>
            )}
            {renderTable()}

            {pagination && (
              <div className="bg-card border border-border rounded-lg shadow-md p-4 mt-6">
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
                        <Label htmlFor="go-to-page" className="text-sm whitespace-nowrap">
                          Ir para:
                        </Label>
                        <Input
                          id="go-to-page"
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

        {showDetails && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-foreground">{selectedItem.name}</h2>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
              </div>
              {loadingDetails ? (
                <div className="text-center py-8 text-foreground">Carregando detalhes...</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(selectedItem)
                    .filter(([key]) => 
                      key !== 'name' && 
                      key !== 'url' && 
                      key !== 'created' && 
                      key !== 'edited' &&
                      key !== 'homeworld' &&
                      !Array.isArray(selectedItem[key])
                    )
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-border pb-2">
                        <span className="font-semibold capitalize text-foreground">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="text-muted-foreground">
                          {typeof value === 'object' && value !== null && Object.keys(value).length === 0 
                            ? "N/A" 
                            : String(value || "N/A")}
                        </span>
                      </div>
                    ))}
                  
                  {/* Homeworld (apenas para pessoas) */}
                  {selectedItem.homeworld && (
                    <div className="flex justify-between border-b border-border pb-2">
                      <span className="font-semibold capitalize text-foreground">
                        Homeworld:
                      </span>
                      <span className="text-muted-foreground">
                        {resolvedNames.homeworld || "Carregando..."}
                      </span>
                    </div>
                  )}

                  {/* Filmes */}
                  {selectedItem.films && Array.isArray(selectedItem.films) && selectedItem.films.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2 text-foreground">Filmes ({selectedItem.films.length})</h3>
                      <div className="max-h-32 overflow-y-auto">
                        {resolvedNames.films && resolvedNames.films.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {resolvedNames.films.map((film, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                              >
                                {film}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Carregando nomes...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Veículos (apenas para pessoas) */}
                  {selectedItem.vehicles && Array.isArray(selectedItem.vehicles) && selectedItem.vehicles.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Veículos ({selectedItem.vehicles.length})</h3>
                      <div className="max-h-32 overflow-y-auto">
                        {resolvedNames.vehicles && resolvedNames.vehicles.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {resolvedNames.vehicles.map((vehicle, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
                              >
                                {vehicle}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Carregando nomes...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Naves (apenas para pessoas) */}
                  {selectedItem.starships && Array.isArray(selectedItem.starships) && selectedItem.starships.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Naves ({selectedItem.starships.length})</h3>
                      <div className="max-h-32 overflow-y-auto">
                        {resolvedNames.starships && resolvedNames.starships.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {resolvedNames.starships.map((starship, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm"
                              >
                                {starship}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Carregando nomes...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Residentes (apenas para planetas) */}
                  {selectedItem.residents && Array.isArray(selectedItem.residents) && selectedItem.residents.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Residentes ({selectedItem.residents.length})</h3>
                      <div className="max-h-32 overflow-y-auto">
                        {resolvedNames.residents && resolvedNames.residents.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {resolvedNames.residents.map((resident, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm"
                              >
                                {resident}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Carregando nomes...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pilotos (apenas para naves) */}
                  {selectedItem.pilots && Array.isArray(selectedItem.pilots) && selectedItem.pilots.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Pilotos ({selectedItem.pilots.length})</h3>
                      <div className="max-h-32 overflow-y-auto">
                        {resolvedNames.pilots && resolvedNames.pilots.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {resolvedNames.pilots.map((pilot, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-sm"
                              >
                                {pilot}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Carregando nomes...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

