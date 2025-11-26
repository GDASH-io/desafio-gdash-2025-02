import React from 'react';
import { Link } from 'react-router-dom';
import { parseISO, format } from 'date-fns';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface MovieRecommendationsProps {
  mood: string;
  suggestions: string[];
  description: string;
  movies: Movie[];
}

const MovieRecommendations: React.FC<MovieRecommendationsProps> = ({ mood, suggestions, description, movies }) => {
  const getRatingColor = (voteAverage: number) => {
    if (voteAverage >= 7) return "bg-green-500";
    if (voteAverage >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div>
      <p className="mb-4">Para um humor <strong>{mood}</strong>, sugerimos filmes de: <strong>{suggestions.join(', ')}</strong>.</p>
      <p className="mb-4 text-muted-foreground">{description}</p>
      
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {movies.slice(0, 10).map((movie) => (
            <Link to={`/movies/${movie.id}`} key={movie.id} className="block">
              <div className="bg-background border border-border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-auto object-cover aspect-[2/3]"
                />
                <div className="p-2">
                  <h4 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">{movie.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{format(parseISO(movie.release_date), 'yyyy')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${getRatingColor(movie.vote_average)}`}>
                      ⭐ {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mt-4">Carregando filmes recomendados...</p>
      )}
    </div>
  );
};

export default MovieRecommendations;
