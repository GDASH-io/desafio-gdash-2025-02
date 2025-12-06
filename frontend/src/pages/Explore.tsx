import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { pokemonService, Pokemon, PokemonDetail } from '@/services/pokemon.service';

export const Explore = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const limit = 20;

  useEffect(() => {
    loadPokemons();
  }, [offset]);

  const loadPokemons = async () => {
    setLoading(true);
    try {
      const data = await pokemonService.getAll(offset, limit);
      setPokemons(data.results);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
    } catch (error) {
      console.error('Erro ao carregar Pokémons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonClick = async (id: number) => {
    try {
      const detail = await pokemonService.getById(id);
      setSelectedPokemon(detail);
    } catch (error) {
      console.error('Erro ao carregar detalhes do Pokémon:', error);
    }
  };

  if (loading && pokemons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando Pokémons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explorar Pokémons</h1>
        <p className="text-gray-600">Descubra e explore diferentes Pokémons</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {pokemons.map((pokemon) => (
          <Card
            key={pokemon.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handlePokemonClick(pokemon.id)}
          >
            <CardHeader>
              <CardTitle className="capitalize">{pokemon.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={pokemon.image} alt={pokemon.name} className="w-full h-48 object-contain" />
              <div className="mt-2 flex gap-2">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={!hasPrevious}>
          Anterior
        </Button>
        <Button onClick={() => setOffset(offset + limit)} disabled={!hasNext}>
          Próximo
        </Button>
      </div>

      {selectedPokemon && (
        <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="capitalize">{selectedPokemon.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <img
                  src={selectedPokemon.image}
                  alt={selectedPokemon.name}
                  className="w-full h-64 object-contain"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Informações Básicas</h3>
                  <p>Altura: {selectedPokemon.height / 10}m</p>
                  <p>Peso: {selectedPokemon.weight / 10}kg</p>
                  <p>Experiência Base: {selectedPokemon.base_experience}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Tipos</h3>
                  <div className="flex gap-2">
                    {selectedPokemon.types.map((type) => (
                      <span
                        key={type.slot}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize"
                      >
                        {type.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Estatísticas</h3>
                  <div className="space-y-1">
                    {selectedPokemon.stats.map((stat) => (
                      <div key={stat.name}>
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{stat.name.replace('-', ' ')}</span>
                          <span>{stat.base_stat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPokemon.abilities.map((ability) => (
                      <span
                        key={ability.name}
                        className="px-2 py-1 bg-gray-100 rounded text-sm capitalize"
                      >
                        {ability.name.replace('-', ' ')}
                        {ability.is_hidden && ' (oculta)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

