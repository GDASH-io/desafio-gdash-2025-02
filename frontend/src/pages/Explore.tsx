import { useState, useEffect, useMemo } from "react";
import { pokemonService, PokemonListItem, PokemonDetail } from "@/services/pokemon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { authService } from "@/services/auth";
import { Search, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";

export function Explore() {
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const user = authService.getUser();

  useEffect(() => {
    loadPokemons(currentPage);
  }, [currentPage]);

  const filteredPokemons = useMemo(() => {
    if (!searchTerm.trim()) {
      return pokemons;
    }

    const term = searchTerm.toLowerCase().trim();
    
    if (/^\d+$/.test(term)) {
      return pokemons.filter((p) => {
        const id = p.url.split("/").filter(Boolean).pop() || "";
        return id === term || p.name.toLowerCase().includes(term);
      });
    }

    return pokemons.filter((p) =>
      p.name.toLowerCase().includes(term)
    );
  }, [pokemons, searchTerm]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setSelectedPokemon(null);
        return;
      }

      const term = searchTerm.toLowerCase().trim();
      
      if (term.length >= 3 || /^\d+$/.test(term)) {
        try {
          setSearchLoading(true);
          const pokemon = await pokemonService.getDetail(term);
          setSelectedPokemon(pokemon);
          setPokemons([]);
        } catch (error) {
          setSelectedPokemon(null);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSelectedPokemon(null);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  const loadPokemons = async (page: number) => {
    try {
      setLoading(true);
      const response = await pokemonService.getList(page, limit);
      setPokemons(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      alert("Erro ao carregar lista de Pokémons");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedPokemon(null);
    loadPokemons(currentPage);
  };

  const handlePokemonClick = async (pokemon: PokemonListItem) => {
    try {
      setDetailLoading(true);
      const pokemonId = pokemon.url.split("/").filter(Boolean).pop() || "";
      const detail = await pokemonService.getDetail(pokemonId);
      setSelectedPokemon(detail);
    } catch (error) {
      alert("Erro ao carregar detalhes do Pokémon");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedPokemon(null);
    loadPokemons(currentPage);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-cyan-300",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-green-400",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-700",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    };
    return colors[type] || "bg-gray-400";
  };

  const getStatName = (statName: string) => {
    const names: Record<string, string> = {
      hp: "HP",
      attack: "Ataque",
      defense: "Defesa",
      "special-attack": "At. Especial",
      "special-defense": "Def. Especial",
      speed: "Velocidade",
    };
    return names[statName] || statName;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName={user?.name} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explorar Pokémons
          </h1>
          <p className="text-gray-600">
            Explore a incrível coleção de Pokémons da PokéAPI
          </p>
        </div>

        {!selectedPokemon ? (
          <>
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome ou ID (ex: pikachu, 25)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {searchLoading && (
                  <div className="flex items-center px-4">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              {searchTerm && !selectedPokemon && (
                <p className="mt-2 text-sm text-gray-500">
                  {filteredPokemons.length > 0
                    ? `Encontrados ${filteredPokemons.length} resultado(s)`
                    : "Nenhum resultado encontrado na página atual"}
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {searchTerm
                    ? `Mostrando ${filteredPokemons.length} resultado(s)`
                    : `Mostrando ${pokemons.length} de ${total} Pokémons`}
                </div>

                {filteredPokemons.length === 0 && searchTerm ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Nenhum Pokémon encontrado com "{searchTerm}"</p>
                    <p className="text-sm mt-2">Tente buscar por nome ou ID</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {filteredPokemons.map((pokemon) => {
                    const pokemonId = pokemon.url.split("/").filter(Boolean).pop() || "";
                    return (
                      <Card
                        key={pokemon.name}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handlePokemonClick(pokemon)}
                      >
                        <CardHeader>
                          <CardTitle className="capitalize text-lg">
                            {pokemon.name}
                          </CardTitle>
                          <CardDescription>ID: {pokemonId}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-center">
                            <img
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                              alt={pokemon.name}
                              className="w-24 h-24"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/96";
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                    })}
                  </div>
                )}

                {!searchTerm && (
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loading}
                      variant="outline"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>

                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </span>

                    <Button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || loading}
                      variant="outline"
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div>
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl capitalize mb-2">
                        {selectedPokemon.name}
                      </CardTitle>
                      <CardDescription>ID: #{selectedPokemon.id}</CardDescription>
                    </div>
                    <Button onClick={handleBackToList} variant="outline">
                      Voltar à lista
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-center mb-4">
                        <img
                          src={selectedPokemon.sprites.front_default}
                          alt={selectedPokemon.name}
                          className="w-48 h-48"
                        />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Tipos</h3>
                          <div className="flex gap-2">
                            {selectedPokemon.types.map((type) => (
                              <span
                                key={type.slot}
                                className={`px-3 py-1 rounded-full text-white text-sm capitalize ${getTypeColor(
                                  type.type.name
                                )}`}
                              >
                                {type.type.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Informações</h3>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium">Altura:</span>{" "}
                              {selectedPokemon.height / 10}m
                            </div>
                            <div>
                              <span className="font-medium">Peso:</span>{" "}
                              {selectedPokemon.weight / 10}kg
                            </div>
                            <div>
                              <span className="font-medium">Experiência Base:</span>{" "}
                              {selectedPokemon.base_experience}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Estatísticas</h3>
                      <div className="space-y-3">
                        {selectedPokemon.stats.map((stat) => (
                          <div key={stat.stat.name}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">
                                {getStatName(stat.stat.name)}
                              </span>
                              <span className="text-sm text-gray-600">
                                {stat.base_stat}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <h3 className="font-semibold mb-2">Sprites</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">Normal</p>
                            <img
                              src={selectedPokemon.sprites.front_default}
                              alt="Front"
                              className="w-24 h-24 mx-auto bg-gray-100 rounded"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">Shiny</p>
                            <img
                              src={selectedPokemon.sprites.front_shiny}
                              alt="Shiny"
                              className="w-24 h-24 mx-auto bg-gray-100 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

