import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pokemonService, { Pokemon } from '../services/pokemon.service';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

const OFFSET_STORAGE_KEY = 'pokedex_offset';
const ITEMS_PER_PAGE = 20;
const TOTAL_POKEMONS = 1025; 

export function Pokedex() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(() => {
    const savedOffset = sessionStorage.getItem(OFFSET_STORAGE_KEY);
    return savedOffset ? parseInt(savedOffset, 10) : 0;
  });
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const totalPages = Math.ceil(TOTAL_POKEMONS / ITEMS_PER_PAGE);
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;

  useEffect(() => {
    loadPokemons();
  }, [offset]);

  useEffect(() => {
    sessionStorage.setItem(OFFSET_STORAGE_KEY, offset.toString());
  }, [offset]);

  const loadPokemons = async () => {
    try {
      setLoading(true);
      const data = await pokemonService.getPokemons(ITEMS_PER_PAGE, offset);
      setPokemons(data.results);
      setHasMore(data.next !== null);
    } catch (error) {
      console.error('Erro ao carregar pokémons:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    const newOffset = (page - 1) * ITEMS_PER_PAGE;
    if (newOffset >= 0 && newOffset < TOTAL_POKEMONS) {
      setOffset(newOffset);
    }
  };

  const handleFirst = () => goToPage(1);
  const handleLast = () => goToPage(totalPages);
  const handlePrevious = () => goToPage(currentPage - 1);
  const handleNext = () => goToPage(currentPage + 1);
  const handleSkipForward = (pages: number) => goToPage(currentPage + pages);
  const handleSkipBackward = (pages: number) => goToPage(currentPage - pages);

  const handlePokemonClick = (pokemonId: number) => {
    sessionStorage.setItem(OFFSET_STORAGE_KEY, offset.toString());
    navigate(`/pokemon/${pokemonId}`);
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      electric: '#F8D030',
      psychic: '#F85888',
      ice: '#98D8D8',
      dragon: '#7038F8',
      dark: '#705848',
      fairy: '#EE99AC',
      normal: '#A8A878',
      fighting: '#C03028',
      flying: '#A890F0',
      poison: '#A040A0',
      ground: '#E0C068',
      rock: '#B8A038',
      bug: '#A8B820',
      ghost: '#705898',
      steel: '#B8B8D0',
    };
    return colors[type] || '#68A090';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Pokédex
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              onClick={() => handlePokemonClick(pokemon.id)}
              className="bg-gray-800 rounded-lg p-6 cursor-pointer transform transition hover:scale-105 hover:shadow-xl"
            >
              <div className="flex justify-center mb-4">
                <img
                  src={pokemon.sprites.official_artwork}
                  alt={pokemon.name}
                  className="w-32 h-32 object-contain"
                />
              </div>
              <h2 className="text-xl font-bold text-white text-center capitalize mb-2">
                {pokemon.name}
              </h2>
              <p className="text-gray-400 text-center mb-3">#{pokemon.id}</p>
              <div className="flex gap-2 justify-center">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                    style={{ backgroundColor: getTypeColor(type) }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        
        <div className="mt-8 space-y-4">
        
          <div className="flex flex-wrap justify-center gap-2">
            <Button 
              onClick={handleFirst}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronsLeft className="w-4 h-4" />
              Início
            </Button>

            <Button 
              onClick={handlePrevious}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button 
              onClick={handleNext}
              disabled={!hasMore}
              variant="outline"
              size="sm"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button 
              onClick={handleLast}
              disabled={!hasMore}
              variant="outline"
              size="sm"
            >
              Final
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>

         
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-gray-400 self-center mr-2">Pular:</span>
            
            <Button 
              onClick={() => handleSkipBackward(10)}
              disabled={currentPage <= 10}
              variant="secondary"
              size="sm"
            >
              -10
            </Button>

            <Button 
              onClick={() => handleSkipBackward(5)}
              disabled={currentPage <= 5}
              variant="secondary"
              size="sm"
            >
              -5
            </Button>

            <Button 
              onClick={() => handleSkipBackward(1)}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
            >
              -1
            </Button>

            <div className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold">
              {currentPage} / {totalPages}
            </div>

            <Button 
              onClick={() => handleSkipForward(1)}
              disabled={currentPage >= totalPages}
              variant="secondary"
              size="sm"
            >
              +1
            </Button>

            <Button 
              onClick={() => handleSkipForward(5)}
              disabled={currentPage > totalPages - 5}
              variant="secondary"
              size="sm"
            >
              +5
            </Button>

            <Button 
              onClick={() => handleSkipForward(10)}
              disabled={currentPage > totalPages - 10}
              variant="secondary"
              size="sm"
            >
              +10
            </Button>
          </div>

         
          <div className="text-center">
            <p className="text-gray-400">
              Mostrando {offset + 1} - {Math.min(offset + ITEMS_PER_PAGE, TOTAL_POKEMONS)} de {TOTAL_POKEMONS} Pokémons
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}