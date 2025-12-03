import { useState, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import {
  getGames,
  getGameById,
  getPlatforms,
  Game,
  GameDetails,
  Platform,
  PaginatedGames,
} from "../services/api";

export default function Games() {
  const [gamesList, setGamesList] = useState<Game[]>([]);
  const [pagination, setPagination] = useState<PaginatedGames | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [selectedGame, setSelectedGame] = useState<GameDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatforms();
    fetchGames();
  }, [page, limit, activeSearch, selectedPlatform]);

  const fetchPlatforms = async () => {
    try {
      const data = await getPlatforms();
      setPlatforms(data);
    } catch (error) {
      console.error("[frontend] Error fetching platforms:", error);
    }
  };

  const fetchGames = async () => {
    setLoading(true);
    try {
      const data = await getGames(
        page,
        limit,
        selectedPlatform || undefined,
        activeSearch.trim() || undefined
      );
      setGamesList(data.data);
      setPagination(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao buscar jogos";
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

  const fetchGameDetails = async (id: number) => {
    try {
      const data = await getGameById(id);
      setSelectedGame(data);
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
    setPage(1);
    setGoToPageInput("");
  };

  const handleClearSearch = () => {
    setSearchName("");
    setActiveSearch("");
    setPage(1);
    setGoToPageInput("");
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Jogos</h1>

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div>
            <Label htmlFor="search-games" className="text-sm font-medium text-foreground mb-2 block">
              Pesquisar por nome:
            </Label>
            <div className="flex gap-2 max-w-md">
              <Input
                id="search-games"
                type="text"
                placeholder="Digite o nome do jogo..."
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

          <div>
            <Label htmlFor="platform-filter" className="text-sm font-medium text-foreground mb-2 block">
              Filtrar por plataforma:
            </Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedPlatform === "" ? "default" : "outline"}
                onClick={() => handlePlatformChange("")}
                size="sm"
              >
                Todas
              </Button>
              {platforms.map((platform) => (
                <Button
                  key={platform.id}
                  variant={selectedPlatform === platform.name ? "default" : "outline"}
                  onClick={() => handlePlatformChange(platform.name)}
                  size="sm"
                >
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <>
            {activeSearch.trim() && gamesList.length === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg mb-4">
                Nenhum jogo encontrado com o nome "{activeSearch}"
              </div>
            )}

            {/* Grid de Jogos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {gamesList.map((game) => (
                <div
                  key={game.id}
                  className="bg-card border border-border rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                  onClick={() => fetchGameDetails(game.id)}
                >
                  {game.image && (
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">{game.name}</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                      <p>
                        <span className="font-semibold">Rating:</span> {game.rating?.toFixed(1) || "N/A"} / {game.ratingTop || 5}
                      </p>
                      {game.released && (
                        <p>
                          <span className="font-semibold">Lançamento:</span> {formatDate(game.released)}
                        </p>
                      )}
                    </div>
                    {game.platforms && game.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {game.platforms.slice(0, 3).map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {platform}
                          </span>
                        ))}
                        {game.platforms.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-foreground rounded text-xs">
                            +{game.platforms.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {game.genres && game.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {game.genres.slice(0, 2).map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs"
                          >
                            {genre}
                          </span>
                        ))}
                        {game.genres.length > 2 && (
                          <span className="px-2 py-1 bg-muted text-foreground rounded text-xs">
                            +{game.genres.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
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
                        <Label htmlFor="go-to-page-games" className="text-sm whitespace-nowrap">
                          Ir para:
                        </Label>
                        <Input
                          id="go-to-page-games"
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

        {/* Modal de Detalhes */}
        {showDetails && selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 text-foreground">{selectedGame.name}</h2>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {selectedGame.released && (
                      <p>
                        <span className="font-semibold">Lançamento:</span> {formatDate(selectedGame.released)}
                      </p>
                    )}
                    {selectedGame.rating !== undefined && (
                      <p>
                        <span className="font-semibold">Rating:</span> {selectedGame.rating.toFixed(1)} / {selectedGame.ratingTop}
                        {selectedGame.ratingsCount && ` (${selectedGame.ratingsCount} avaliações)`}
                      </p>
                    )}
                    {selectedGame.metacritic && (
                      <p>
                        <span className="font-semibold">Metacritic:</span> {selectedGame.metacritic}
                      </p>
                    )}
                    {selectedGame.esrbRating && (
                      <p>
                        <span className="font-semibold">ESRB:</span> {selectedGame.esrbRating}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  {selectedGame.image && (
                    <img
                      src={selectedGame.image}
                      alt={selectedGame.name}
                      className="w-full rounded-lg mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                  )}
                </div>
                <div>
                  {selectedGame.description && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2 text-foreground">Descrição</h3>
                      <p className="text-sm text-muted-foreground line-clamp-10">
                        {selectedGame.description.replace(/<[^>]*>/g, "")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Screenshots */}
              {selectedGame.screenshots && selectedGame.screenshots.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-foreground">Screenshots</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedGame.screenshots.map((screenshot, index) => (
                      <img
                        key={index}
                        src={screenshot}
                        alt={`${selectedGame.name} screenshot ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
                        onClick={() => window.open(screenshot, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedGame.platforms && selectedGame.platforms.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Plataformas</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.platforms.map((platform: any) => (
                        <span
                          key={platform.name}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                        >
                          {platform.name}
                          {platform.releasedAt && ` (${formatDate(platform.releasedAt)})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGame.genres && selectedGame.genres.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Gêneros</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGame.developers && selectedGame.developers.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Desenvolvedores</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.developers.map((developer) => (
                        <span
                          key={developer}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
                        >
                          {developer}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGame.publishers && selectedGame.publishers.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Publicadoras</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.publishers.map((publisher) => (
                        <span
                          key={publisher}
                          className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-sm"
                        >
                          {publisher}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedGame.website && (
                <div className="mt-6">
                  <a
                    href={selectedGame.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Visitar site oficial →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
