import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Explore = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setLoading(true);
        setError(null);
        const offset = (currentPage - 1) * limit;
        const response = await axios.get(`${API_URL}/api/pokemon?limit=${limit}&offset=${offset}`);

        setPokemons(response.data.pokemons);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error('Erro ao buscar Pokémons:', err);
        setError('Erro ao carregar Pokémons. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchPokemons();
  }, [currentPage, limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePokemonClick = (idOrName) => {
    navigate(`/explore/${idOrName}`);
  };

  const getPokemonId = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 2];
  };

  const getPokemonImage = (id) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  };

  if (loading && pokemons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Carregando Pokémons...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erro ao Carregar</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center space-x-3">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <span>Explorar Pokémons</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Navegue pela Pokédex completa com {totalPages * limit}+ Pokémons
              </p>
            </div>
          </div>
        </div>

        {/* Pagination Top */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Página <span className="font-bold">{currentPage}</span> de{' '}
            <span className="font-bold">{totalPages}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center space-x-1">
              {currentPage > 2 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={loading}
                  >
                    1
                  </Button>
                  {currentPage > 3 && <span className="px-2">...</span>}
                </>
              )}

              {currentPage > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={loading}
                >
                  {currentPage - 1}
                </Button>
              )}

              <Button variant="default" size="sm" disabled>
                {currentPage}
              </Button>

              {currentPage < totalPages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={loading}
                >
                  {currentPage + 1}
                </Button>
              )}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={loading}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Pokemon Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pokemons.map((pokemon) => {
              const id = getPokemonId(pokemon.url);
              return (
                <Card
                  key={pokemon.name}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800"
                  onClick={() => handlePokemonClick(pokemon.name)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={getPokemonImage(id)}
                        alt={pokemon.name}
                        className="w-full h-full object-contain p-2 hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        #{id.padStart(3, '0')}
                      </p>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                        {pokemon.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Bottom */}
        <div className="flex items-center justify-center mt-8 space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Próximo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Explore;
