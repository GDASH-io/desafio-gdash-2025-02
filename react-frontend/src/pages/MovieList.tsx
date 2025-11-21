import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}

export const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/tmdb/popular?page=${page}`);
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

  if (loading) return <div>Loading movies...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Popular Movies</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Link to={`/movies/${movie.id}`} key={movie.id}>
            <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto"
              />
              <div className="p-2">
                <h2 className="font-semibold text-lg">{movie.title}</h2>
                <p className="text-sm text-gray-600">{movie.release_date}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-lg">Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};
