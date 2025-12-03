import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Globe, Search } from 'lucide-react';
import { externalService } from '@/services/external.service';
import { Pokemon, StarWarsCharacter } from '@/types';

export function Explore() {
  const [activeTab, setActiveTab] = useState('pokemon');

  // Pokemon state
  // const [pokemons, setPokemons] = useState<any[]>([]);
  const [pokemonDetails, setPokemonDetails] = useState<Pokemon[]>([]);
  const [pokemonPage, setPokemonPage] = useState(1);
  const [pokemonSearch, setPokemonSearch] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [pokemonLoading, setPokemonLoading] = useState(false);

  // Star Wars state
  const [characters, setCharacters] = useState<StarWarsCharacter[]>([]);
  const [swPage, setSwPage] = useState(1);
  const [swSearch, setSwSearch] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<StarWarsCharacter | null>(null);
  const [swLoading, setSwLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'pokemon') loadPokemons();
    else loadStarWarsCharacters();
  }, [activeTab, pokemonPage, swPage]);

  async function loadPokemons() {
    setPokemonLoading(true);
    try {
      const offset = (pokemonPage - 1) * 10;
      const { results } = await externalService.getPokemonList(offset, 10);

      const details = await Promise.all(
        results.map((p: any) => externalService.getPokemonDetails(p.name))
      );

      setPokemonDetails(details);
    } catch (error) {
      console.error('Error loading pokemons:', error);
    } finally {
      setPokemonLoading(false);
    }
  }

  async function loadStarWarsCharacters() {
    setSwLoading(true);
    try {
      const { results } = await externalService.getStarWarsCharacters(swPage);
      setCharacters(results);
    } catch (error) {
      console.error('Error loading Star Wars characters:', error);
    } finally {
      setSwLoading(false);
    }
  }

  const getPokemonTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      grass: 'bg-green-500',
      poison: 'bg-purple-500',
      fire: 'bg-orange-500',
      water: 'bg-blue-500',
      bug: 'bg-lime-500',
      normal: 'bg-gray-400',
      electric: 'bg-yellow-500',
      ground: 'bg-yellow-700',
      fairy: 'bg-pink-400',
      fighting: 'bg-red-700',
      psychic: 'bg-pink-500',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      ice: 'bg-cyan-400',
      dragon: 'bg-indigo-600',
      dark: 'bg-gray-800',
      steel: 'bg-gray-500',
      flying: 'bg-indigo-400',
    };
    return colors[type] || 'bg-gray-400';
  };

  const getAffiliation = (character: StarWarsCharacter): { label: string; color: string } => {
    // Simulação baseada em nome
    const name = character.name.toLowerCase();
    if (name.includes('skywalker') || name.includes('kenobi')) {
      return { label: 'Jedi', color: 'bg-primary' };
    }
    if (name.includes('vader') || name.includes('palpatine')) {
      return { label: 'Sith', color: 'bg-red-600' };
    }
    if (name.includes('solo') || name.includes('chewbacca')) {
      return { label: 'Smuggler', color: 'bg-gray-600' };
    }
    return { label: 'Rebellion', color: 'bg-orange-600' };
  };

  const filteredPokemons = pokemonDetails.filter((p) =>
    p.name.toLowerCase().includes(pokemonSearch.toLowerCase())
  );

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(swSearch.toLowerCase())
  );

  return (
    <div>
      <Header title="Explorar" icon={<Globe className="h-6 w-6" />} />

      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold">Explorar APIs Externas</h2>
          <p className="text-sm text-gray-600">
            Exemplos de integração com APIs públicas paginadas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pokemon">Pokémon API</TabsTrigger>
            <TabsTrigger value="starwars">Star Wars API</TabsTrigger>
          </TabsList>

          {/* Pokemon Tab */}
          <TabsContent value="pokemon" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar pokémon..."
                value={pokemonSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPokemonSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {pokemonLoading ? (
              <p className="text-center">Carregando...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {filteredPokemons.map((pokemon) => (
                  <Card
                    key={pokemon.id}
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setSelectedPokemon(pokemon)}
                  >
                    <CardHeader className="pb-2">
                      <div
                        className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${getPokemonTypeColor(
                          pokemon.types[0].type.name
                        )}`}
                      >
                        <span className="text-3xl text-white">?</span>
                      </div>
                      <p className="text-center text-xs text-gray-500">
                        #{pokemon.id.toString().padStart(3, '0')}
                      </p>
                      <CardTitle className="text-center text-base capitalize">
                        {pokemon.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center gap-1">
                      {pokemon.types.map((t: any) => (
                        <Badge
                          key={t.type.name}
                          className={`${getPokemonTypeColor(t.type.name)} border-0 text-white`}
                        >
                          {t.type.name}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPokemonPage((p) => Math.max(1, p - 1))}
                disabled={pokemonPage === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">Página {pokemonPage}</span>
              <Button variant="outline" onClick={() => setPokemonPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          </TabsContent>

          {/* Star Wars Tab */}
          <TabsContent value="starwars" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar personagem..."
                value={swSearch}
                onChange={(e) => setSwSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {swLoading ? (
              <p className="text-center">Carregando...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCharacters.map((character, index) => {
                  const affiliation = getAffiliation(character);
                  return (
                    <Card
                      key={index}
                      className="cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setSelectedCharacter(character)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-white">
                              {character.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-base">{character.name}</CardTitle>
                            <p className="text-xs text-gray-600">Espécie: {character.species[0] || 'Humano'}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">🌍</span>
                          <span>Planeta Natal</span>
                        </div>
                        <Badge className={`${affiliation.color} border-0 text-white`}>
                          {affiliation.label}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setSwPage((p) => Math.max(1, p - 1))}
                disabled={swPage === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">Página {swPage}</span>
              <Button variant="outline" onClick={() => setSwPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pokemon Details Dialog */}
      <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
        <DialogContent className="max-w-2xl">
          {selectedPokemon && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl capitalize">{selectedPokemon.name}</DialogTitle>
                <DialogDescription>#{selectedPokemon.id.toString().padStart(3, '0')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {selectedPokemon.types.map((t: any) => (
                    <Badge key={t.type.name} className={`${getPokemonTypeColor(t.type.name)} border-0 text-white`}>
                      {t.type.name}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Altura:</strong> {selectedPokemon.height / 10}m
                  </div>
                  <div>
                    <strong>Peso:</strong> {selectedPokemon.weight / 10}kg
                  </div>
                </div>
                <div>
                  <strong className="text-sm">Habilidades:</strong>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPokemon.abilities.map((a: any) => (
                      <Badge key={a.ability.name} variant="outline" className="capitalize">
                        {a.ability.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <strong className="text-sm">Estatísticas Base:</strong>
                  <div className="mt-2 space-y-2">
                    {selectedPokemon.stats.map((s: any) => (
                      <div key={s.stat.name}>
                        <div className="flex justify-between text-xs">
                          <span className="capitalize">{s.stat.name}</span>
                          <span>{s.base_stat}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(s.base_stat / 255) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Star Wars Character Dialog */}
      <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
        <DialogContent>
          {selectedCharacter && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-2xl text-white">
                      {selectedCharacter.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{selectedCharacter.name}</DialogTitle>
                    <DialogDescription>
                      {selectedCharacter.species[0] || 'Humano'} • Planeta Natal
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Badge className={`${getAffiliation(selectedCharacter).color} border-0 text-white`}>
                    {getAffiliation(selectedCharacter).label}
                  </Badge>
                </div>
                <div>
                  <strong className="text-sm">Aparições em Filmes:</strong>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedCharacter.films.length} filme(s)
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Nota: Os dados completos viriam da API real. Este é um exemplo com dados simulados.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}