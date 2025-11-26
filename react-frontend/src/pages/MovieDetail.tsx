import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface MovieDetailType {
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  runtime: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/tmdb/movie/${id}`);
        setMovie(response.data);
      } catch (err) {
        setError('Failed to fetch movie details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetail();
  }, [id]);

  if (loading) return <div className="text-[#E5E7EB]">Carregando detalhes do filme...</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;
  if (!movie) return <div className="text-[#E5E7EB]">Filme não encontrado.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row bg-[#161B22] border border-[#1F2937] shadow-lg rounded-lg overflow-hidden">
        <div className="md:w-1/3">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="md:w-2/3 p-6">
          <h1 className="text-3xl font-bold mb-2 text-[#E5E7EB]">{movie.title}</h1>
          <p className="text-[#E5E7EB] text-lg mb-4">{movie.overview}</p>
          <div className="mb-4">
            <span className="font-semibold text-[#E5E7EB]">Data de Lançamento:</span>
            <span className="text-[#9CA3AF] ml-2">{movie.release_date}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-[#E5E7EB]">Avaliação:</span>
            <span className="text-[#9CA3AF] ml-2">{movie.vote_average?.toFixed(1)}/10</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-[#E5E7EB]">Duração:</span>
            <span className="text-[#9CA3AF] ml-2">{movie.runtime} minutos</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-[#E5E7EB]">Gêneros:</span>
            <span className="text-[#9CA3AF] ml-2">{movie.genres.map((genre) => genre.name).join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
