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

export const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/tmdb/movie/${id}`);
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

  if (loading) return <div>Loading movie details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!movie) return <div>Movie not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:w-1/3">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="md:w-2/3 p-6">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <p className="text-gray-700 text-lg mb-4">{movie.overview}</p>
          <div className="mb-4">
            <span className="font-semibold">Release Date:</span> {movie.release_date}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Rating:</span> {movie.vote_average?.toFixed(1)}/10
          </div>
          <div className="mb-4">
            <span className="font-semibold">Runtime:</span> {movie.runtime} minutes
          </div>
          <div className="mb-4">
            <span className="font-semibold">Genres:</span> {movie.genres.map((genre) => genre.name).join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
};
