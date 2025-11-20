import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { pokemonService } from '@/services/pokemon.service';
import { useToast } from '@/components/ui/use-toast';
import { Search, X } from 'lucide-react';

export default function ExplorePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['pokemon', page, search],
    queryFn: () => pokemonService.getList(page, 20, search),
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // Resetar para primeira página ao buscar
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const { data: pokemonDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['pokemon', selectedPokemon],
    queryFn: () => pokemonService.getById(selectedPokemon!),
    enabled: !!selectedPokemon,
  });

  // Componente de skeleton para card de Pokémon
  const PokemonCardSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="w-full h-32 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );

  // Componente de skeleton para detalhes do Pokémon
  const PokemonDetailSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="w-full h-48" />
      <div>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Explorar Pokémons</h1>
        <p className="text-muted-foreground">Lista de Pokémons via API externa</p>
      </div>

      {/* Campo de busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou tipo (ex: pikachu, fire)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10 pr-10"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            {search && (
              <Button variant="outline" onClick={handleClearSearch}>
                Limpar
              </Button>
            )}
          </div>
          {search && (
            <p className="mt-2 text-sm text-muted-foreground">
              Buscando por: <span className="font-semibold">{search}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lista de Pokémons */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pokémons</CardTitle>
              <CardDescription>
                {isLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : search ? (
                  `${data?.total || 0} resultado(s) encontrado(s)`
                ) : (
                  `Total: ${data?.total || 0} Pokémons`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <PokemonCardSkeleton key={index} />
                  ))}
                </div>
              ) : data?.data.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {search ? 'Nenhum Pokémon encontrado com esse termo.' : 'Nenhum Pokémon encontrado.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data?.data.map((pokemon) => (
                  <Card
                    key={pokemon.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedPokemon(pokemon.id)}
                  >
                    <CardContent className="p-4">
                      <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="w-full h-32 object-contain mb-2"
                      />
                      <h3 className="font-semibold capitalize">{pokemon.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pokemon.types.join(', ')}
                      </p>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              )}

              {!isLoading && data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {page} de {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === data.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Pokémon */}
        <div>
          {selectedPokemon && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDetail ? (
                  <PokemonDetailSkeleton />
                ) : pokemonDetail ? (
                  <div className="space-y-4">
                    <img
                      src={pokemonDetail.image}
                      alt={pokemonDetail.name}
                      className="w-full h-48 object-contain"
                    />
                    <div>
                      <h3 className="text-xl font-bold capitalize">{pokemonDetail.name}</h3>
                      <p className="text-sm text-muted-foreground">#{pokemonDetail.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tipos</p>
                      <div className="flex gap-2 mt-1">
                        {pokemonDetail.types.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Altura</p>
                        <p className="text-sm text-muted-foreground">
                          {(pokemonDetail.height / 10).toFixed(1)} m
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Peso</p>
                        <p className="text-sm text-muted-foreground">
                          {(pokemonDetail.weight / 10).toFixed(1)} kg
                        </p>
                      </div>
                    </div>
                    {pokemonDetail.abilities && (
                      <div>
                        <p className="text-sm font-medium">Habilidades</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {pokemonDetail.abilities.map((ability) => (
                            <span
                              key={ability}
                              className="px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                              {ability}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {pokemonDetail.stats && (
                      <div>
                        <p className="text-sm font-medium mb-2">Estatísticas</p>
                        <div className="space-y-1">
                          {pokemonDetail.stats.map((stat) => (
                            <div key={stat.name} className="flex justify-between text-sm">
                              <span className="capitalize">{stat.name}</span>
                              <span className="font-medium">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Selecione um Pokémon para ver os detalhes
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

