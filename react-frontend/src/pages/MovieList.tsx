import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Film } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const fetchMovies = async (pageNum: number = 1, query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (query.trim()) {
        setIsSearching(true);
        response = await axios.get(`${API_BASE_URL}/api/tmdb/search?query=${encodeURIComponent(query)}&page=${pageNum}`);
      } else {
        setIsSearching(false);
        response = await axios.get(`${API_BASE_URL}/api/tmdb/popular?page=${pageNum}`);
      }
      
      setMovies(response.data.results || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      setError('Erro ao buscar filmes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        setPage(1);
        fetchMovies(1, searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      fetchMovies(page);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchMovies(page);
    }
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMovies(1, searchQuery);
  };

  if (loading && movies.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-[#E5E7EB] text-lg">Carregando filmes...</p>
        </div>
      </div>
    );
  }

  if (error && movies.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-500 text-lg">Erro: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-[#E5E7EB] flex items-center gap-2">
          <Film className="h-8 w-8 text-[#3B82F6]" />
          {isSearching ? 'Resultados da Busca' : 'Filmes Populares'}
        </h1>
        <p className="text-sm text-[#9CA3AF]">
          {isSearching 
            ? `Encontrados ${movies.length} resultados para "${searchQuery}"`
            : 'Explore os filmes mais populares do momento'
          }
        </p>
      </div>

      <div className="p-4 bg-[#161B22] border border-[#1F2937] rounded-lg">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
            <Input
              type="text"
              placeholder="Buscar filmes por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-11 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:w-auto">
            <Button 
              type="submit" 
              className="px-6 h-11 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          {searchQuery && (
            <Button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPage(1);
                setIsSearching(false);
              }}
                className="px-6 h-11 bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] w-full sm:w-auto"
            >
              Limpar
            </Button>
          )}
          </div>
        </form>
      </div>

      {loading && movies.length > 0 && (
        <div className="text-center py-4">
          <p className="text-[#9CA3AF]">Carregando...</p>
        </div>
      )}

      {!loading && movies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-[#161B22] border border-[#1F2937] rounded-lg">
          <Search className="h-12 w-12 text-[#9CA3AF] mb-4" />
          <p className="text-[#E5E7EB] text-lg mb-2">
            {searchQuery ? 'Nenhum filme encontrado' : 'Nenhum filme disponível'}
          </p>
          <p className="text-[#9CA3AF] text-sm">
            {searchQuery 
              ? `Tente buscar com outros termos para "${searchQuery}"`
              : 'Tente novamente mais tarde'
            }
          </p>
        </div>
      )}

      {movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <Link to={`/movies/${movie.id}`} key={movie.id}>
                <div className="border border-[#1F2937] rounded-lg overflow-hidden bg-[#161B22] shadow-lg hover:shadow-xl hover:border-[#3B82F6] transition-all duration-300 cursor-pointer group">
                  <div className="relative overflow-hidden">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE2MUIyMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TZW0gSW1hZ2VtPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-[#0D1117] flex items-center justify-center">
                        <Film className="h-12 w-12 text-[#9CA3AF]" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="font-semibold text-lg text-[#E5E7EB] line-clamp-2 group-hover:text-[#3B82F6] transition-colors">
                      {movie.title}
                    </h2>
                    {movie.release_date && (
                      <p className="text-sm text-[#9CA3AF] mt-1">
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-[#161B22] border border-[#1F2937] rounded-lg">
            <div className="text-sm text-[#9CA3AF]">
              Página {page} de {totalPages}
            </div>
            <div className="flex gap-3 flex-wrap w-full md:w-auto justify-center">
              <Button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
                className="px-6 py-2 bg-[#3B82F6] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3B82F6]/90 transition-colors"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || loading}
                className="px-6 py-2 bg-[#3B82F6] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3B82F6]/90 transition-colors"
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
