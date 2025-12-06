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
import { Globe, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { externalService } from '@/services/external.service';
import { Pokemon, StarWarsCharacter } from '@/types';

export function Explore() {
  const [activeTab, setActiveTab] = useState('pokemon');

  // Pokemon state
  const [pokemonDetails, setPokemonDetails] = useState<Pokemon[]>([]);
  const [pokemonPage, setPokemonPage] = useState(1);
  const [pokemonTotalPages] = useState(132); // PokéAPI has ~1302 pokémon / 10 per page
  const [pokemonJumpPage, setPokemonJumpPage] = useState('');
  const [pokemonSearch, setPokemonSearch] = useState('');
  const [pokemonSearchDebounce, setPokemonSearchDebounce] = useState('');
  const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchPage, setSearchPage] = useState(1); // Página para resultados de busca
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [pokemonLoading, setPokemonLoading] = useState(false);

  // Star Wars state
  const [characters, setCharacters] = useState<StarWarsCharacter[]>([]);
  const [swPage, setSwPage] = useState(1);
  const [swTotalPages] = useState(9); // SWAPI has 82 characters / 9 per page = 9.1 -> 9 páginas completas
  const [swJumpPage, setSwJumpPage] = useState('');
  const [swSearch, setSwSearch] = useState('');
  const [swSearchDebounce, setSwSearchDebounce] = useState('');
  const [allSwCharacters, setAllSwCharacters] = useState<StarWarsCharacter[]>([]);
  const [swSearchResults, setSwSearchResults] = useState<StarWarsCharacter[]>([]);
  const [swSearchPage, setSwSearchPage] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState<StarWarsCharacter | null>(null);
  const [swLoading, setSwLoading] = useState(false);

  // Carregar todos os nomes de Pokémon uma vez
  useEffect(() => {
    async function loadAllNames() {
      try {
        const names = await externalService.getAllPokemonNames();
        setAllPokemonNames(names);
      } catch (error) {
        console.error('Error loading pokemon names:', error);
      }
    }
    loadAllNames();
  }, []);

  // Carregar todos os personagens de Star Wars uma vez
  useEffect(() => {
    async function loadAllCharacters() {
      try {
        const allChars: StarWarsCharacter[] = [];
        // SWAPI tem 9 páginas de 10 personagens (82 total)
        for (let i = 1; i <= 9; i++) {
          const { results } = await externalService.getStarWarsCharacters(i);
          allChars.push(...results);
        }
        setAllSwCharacters(allChars);
      } catch (error) {
        console.error('Error loading Star Wars characters:', error);
      }
    }
    loadAllCharacters();
  }, []);

  // Debounce para busca de Pokémon
  useEffect(() => {
    const timer = setTimeout(() => {
      setPokemonSearchDebounce(pokemonSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [pokemonSearch]);

  // Debounce para busca de Star Wars
  useEffect(() => {
    const timer = setTimeout(() => {
      setSwSearchDebounce(swSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [swSearch]);

  // Filtrar nomes de Pokémon quando busca muda
  useEffect(() => {
    if (pokemonSearchDebounce.trim() && allPokemonNames.length > 0) {
      const filtered = allPokemonNames.filter(name =>
        name.toLowerCase().includes(pokemonSearchDebounce.toLowerCase())
      );
      setSearchResults(filtered);
      setSearchPage(1); // Resetar para primeira página ao buscar
    } else {
      setSearchResults([]);
    }
  }, [pokemonSearchDebounce, allPokemonNames]);

  // Filtrar personagens de Star Wars quando busca muda
  useEffect(() => {
    if (swSearchDebounce.trim() && allSwCharacters.length > 0) {
      const filtered = allSwCharacters.filter(char =>
        char.name.toLowerCase().includes(swSearchDebounce.toLowerCase())
      );
      setSwSearchResults(filtered);
      setSwSearchPage(1); // Resetar para primeira página ao buscar
    } else {
      setSwSearchResults([]);
    }
  }, [swSearchDebounce, allSwCharacters]);

  useEffect(() => {
    if (activeTab === 'pokemon') loadPokemons();
    else loadStarWarsCharacters();
  }, [activeTab, pokemonPage, searchPage, searchResults, swPage, swSearchPage, swSearchResults]);

  async function loadPokemons() {
    setPokemonLoading(true);
    try {
      // Se há busca, mostrar resultados filtrados com paginação
      if (searchResults.length > 0) {
        const startIndex = (searchPage - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedResults = searchResults.slice(startIndex, endIndex);

        const details = await Promise.all(
          paginatedResults.map((name: string) => externalService.getPokemonDetails(name))
        );
        setPokemonDetails(details);
      } else if (pokemonSearchDebounce.trim()) {
        // Se há busca mas sem resultados, mostrar vazio
        setPokemonDetails([]);
      } else {
        // Carregamento normal paginado
        const offset = (pokemonPage - 1) * 10;
        const { results } = await externalService.getPokemonList(offset, 10);

        const details = await Promise.all(
          results.map((p: any) => externalService.getPokemonDetails(p.name))
        );

        setPokemonDetails(details);
      }
    } catch (error) {
      console.error('Error loading pokemons:', error);
      setPokemonDetails([]);
    } finally {
      setPokemonLoading(false);
    }
  }

  async function loadStarWarsCharacters() {
    setSwLoading(true);
    try {
      // Se há busca, mostrar resultados filtrados com paginação
      if (swSearchResults.length > 0) {
        const startIndex = (swSearchPage - 1) * 9;
        const endIndex = startIndex + 9;
        const paginatedResults = swSearchResults.slice(startIndex, endIndex);
        setCharacters(paginatedResults);
      } else if (swSearchDebounce.trim()) {
        // Se há busca mas sem resultados, mostrar vazio
        setCharacters([]);
      } else {
        // Carregamento normal paginado - mostrar 9 por página
        const { results } = await externalService.getStarWarsCharacters(swPage);
        // Pegar apenas os primeiros 9 personagens da página
        const limitedResults = results.slice(0, 9);
        setCharacters(limitedResults);
      }
    } catch (error) {
      console.error('Error loading Star Wars characters:', error);
      setCharacters([]);
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

  // Não precisa mais filtrar localmente, já filtramos na API
  const filteredPokemons = pokemonDetails;
  const filteredCharacters = characters;

  // Função para gerar números de páginas visíveis
  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Handlers para pular para página
  const handlePokemonJumpPage = () => {
    const page = parseInt(pokemonJumpPage);
    if (page >= 1 && page <= pokemonTotalPages) {
      setPokemonPage(page);
      setPokemonJumpPage('');
    }
  };

  const handleSwJumpPage = () => {
    const page = parseInt(swJumpPage);
    if (page >= 1 && page <= swTotalPages) {
      setSwPage(page);
      setSwJumpPage('');
    }
  };

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
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar pokémon (ex: pika, char, bulba)..."
                  value={pokemonSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPokemonSearch(e.target.value);
                    // Resetar página ao buscar
                    if (e.target.value.trim()) setPokemonPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              {pokemonSearch.trim() && (
                <p className="text-xs text-gray-500">
                  {searchResults.length > 0
                    ? `${searchResults.length} resultado(s) encontrado(s)`
                    : 'Nenhum pokémon encontrado com esse nome.'}
                </p>
              )}
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
                      <div className="mx-auto flex h-24 w-24 items-center justify-center">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                          alt={pokemon.name}
                          className="h-full w-full object-contain transition-transform hover:scale-110"
                          onError={(e) => {
                            // Fallback para sprite alternativo se oficial não carregar
                            e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                          }}
                        />
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

            {/* Paginação Completa - Pokémon */}
            {pokemonSearch.trim() && searchResults.length > 0 ? (
              // Paginação para resultados de busca
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* Primeira Página */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchPage(1)}
                    disabled={searchPage === 1}
                    title="Primeira página"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>

                  {/* Anterior */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                    disabled={searchPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  {/* Páginas numeradas */}
                  {getPageNumbers(searchPage, Math.ceil(searchResults.length / 10)).map((page) => (
                    <Button
                      key={page}
                      variant={page === searchPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSearchPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}

                  {/* Próxima */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchPage((p) => Math.min(Math.ceil(searchResults.length / 10), p + 1))}
                    disabled={searchPage === Math.ceil(searchResults.length / 10)}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>

                  {/* Última Página */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchPage(Math.ceil(searchResults.length / 10))}
                    disabled={searchPage === Math.ceil(searchResults.length / 10)}
                    title="Última página"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Info da página */}
                <p className="text-center text-sm text-gray-600">
                  Página {searchPage} de {Math.ceil(searchResults.length / 10)}
                </p>
              </div>
            ) : !pokemonSearch.trim() && (
              // Paginação normal
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                {/* Primeira Página */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPokemonPage(1)}
                  disabled={pokemonPage === 1}
                  title="Primeira página"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Anterior */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPokemonPage((p) => Math.max(1, p - 1))}
                  disabled={pokemonPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                {/* Páginas numeradas */}
                {getPageNumbers(pokemonPage, pokemonTotalPages).map((page) => (
                  <Button
                    key={page}
                    variant={page === pokemonPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPokemonPage(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                ))}

                {/* Próxima */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPokemonPage((p) => Math.min(pokemonTotalPages, p + 1))}
                  disabled={pokemonPage === pokemonTotalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>

                {/* Última Página */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPokemonPage(pokemonTotalPages)}
                  disabled={pokemonPage === pokemonTotalPages}
                  title="Última página"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>

                {/* Input para ir para página */}
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Ir p/ página..."
                    className="w-32"
                    min={1}
                    max={pokemonTotalPages}
                    value={pokemonJumpPage}
                    onChange={(e) => setPokemonJumpPage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handlePokemonJumpPage();
                    }}
                  />
                  <Button size="sm" onClick={handlePokemonJumpPage}>
                    Ir
                  </Button>
                </div>
              </div>

                {/* Info da página */}
                <p className="text-center text-sm text-gray-600">
                  Página {pokemonPage} de {pokemonTotalPages}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Star Wars Tab */}
          <TabsContent value="starwars" className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar personagem (ex: luke, vader, leia)..."
                  value={swSearch}
                  onChange={(e) => {
                    setSwSearch(e.target.value);
                    // Resetar página ao buscar
                    if (e.target.value.trim()) setSwPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              {swSearch.trim() && (
                <p className="text-xs text-gray-500">
                  {swSearchResults.length > 0
                    ? `${swSearchResults.length} resultado(s) encontrado(s)`
                    : 'Nenhum personagem encontrado com esse nome.'}
                </p>
              )}
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
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-semibold">
                            {character.name.charAt(0)}
                          </div>
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

            {/* Paginação Completa - Star Wars */}
            {swSearch.trim() && swSearchResults.length > 0 ? (
              // Paginação para resultados de busca
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* Primeira Página */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSwSearchPage(1)}
                    disabled={swSearchPage === 1}
                    title="Primeira página"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>

                  {/* Anterior */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSwSearchPage((p) => Math.max(1, p - 1))}
                    disabled={swSearchPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  {/* Páginas numeradas */}
                  {getPageNumbers(swSearchPage, Math.ceil(swSearchResults.length / 9)).map((page) => (
                    <Button
                      key={page}
                      variant={page === swSearchPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSwSearchPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}

                  {/* Próxima */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSwSearchPage((p) => Math.min(Math.ceil(swSearchResults.length / 9), p + 1))}
                    disabled={swSearchPage === Math.ceil(swSearchResults.length / 9)}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>

                  {/* Última Página */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSwSearchPage(Math.ceil(swSearchResults.length / 9))}
                    disabled={swSearchPage === Math.ceil(swSearchResults.length / 9)}
                    title="Última página"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Info da página */}
                <p className="text-center text-sm text-gray-600">
                  Página {swSearchPage} de {Math.ceil(swSearchResults.length / 9)}
                </p>
              </div>
            ) : !swSearch.trim() && (
              // Paginação normal
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* Primeira Página */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSwPage(1)}
                    disabled={swPage === 1}
                    title="Primeira página"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>

                  {/* Anterior */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSwPage((p) => Math.max(1, p - 1))}
                    disabled={swPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  {/* Páginas numeradas */}
                  {getPageNumbers(swPage, swTotalPages).map((page) => (
                    <Button
                      key={page}
                      variant={page === swPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSwPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}

                  {/* Próxima */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSwPage((p) => Math.min(swTotalPages, p + 1))}
                    disabled={swPage === swTotalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>

                  {/* Última Página */}
                  <Button
                    variant="outline"
                  size="sm"
                    onClick={() => setSwPage(swTotalPages)}
                    disabled={swPage === swTotalPages}
                    title="Última página"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>

                  {/* Input para ir para página */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Ir p/ página..."
                      className="w-32"
                      min={1}
                      max={swTotalPages}
                      value={swJumpPage}
                      onChange={(e) => setSwJumpPage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSwJumpPage();
                      }}
                    />
                    <Button size="sm" onClick={handleSwJumpPage}>
                      Ir
                    </Button>
                  </div>
                </div>

                {/* Info da página */}
                <p className="text-center text-sm text-gray-600">
                  Página {swPage} de {swTotalPages}
                </p>
              </div>
            )}
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
                {/* Imagem grande do Pokémon */}
                <div className="flex justify-center">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`}
                    alt={selectedPokemon.name}
                    className="h-48 w-48 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`;
                    }}
                  />
                </div>
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
                <div className="flex flex-col items-center gap-4">
                  {/* Avatar grande do personagem */}
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-white font-bold text-5xl">
                    {selectedCharacter.name.charAt(0)}
                  </div>
                  <div className="text-center">
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