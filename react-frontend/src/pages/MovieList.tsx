import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/tmdb/popular?page=${page}`);
        setMovies(response.data.results);
      } catch (err) {
        setError('Failed to fetch movies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [page]);

  if (loading) return <div className="text-[#E5E7EB]">Carregando filmes...</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-[#E5E7EB]">Filmes Populares</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Link to={`/movies/${movie.id}`} key={movie.id}>
            <div className="border border-[#1F2937] rounded-lg overflow-hidden bg-[#161B22] shadow-lg hover:shadow-xl hover:border-[#3B82F6] transition-all duration-300 cursor-pointer">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto"
              />
              <div className="p-3">
                <h2 className="font-semibold text-lg text-[#E5E7EB] line-clamp-2">{movie.title}</h2>
                <p className="text-sm text-[#9CA3AF] mt-1">{movie.release_date}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3B82F6]/90 transition-colors"
        >
          Anterior
        </button>
        <span className="text-lg text-[#E5E7EB]">Página {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#3B82F6]/90 transition-colors"
        >
          Próxima
        </button>
      </div>
    </div>
  );
};
