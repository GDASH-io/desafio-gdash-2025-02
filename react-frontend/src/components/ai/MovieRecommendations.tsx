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
    <div className="space-y-3">
      <p className="text-sm font-light text-[#E5E7EB]">Para um humor <span className="font-medium">{mood}</span>, sugerimos filmes de: <span className="font-medium">{suggestions.join(', ')}</span>.</p>
      <p className="text-sm font-light text-[#9CA3AF]">{description}</p>
      
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3">
          {movies.slice(0, 10).map((movie) => (
            <Link to={`/movies/${movie.id}`} key={movie.id} className="block">
              <div className="bg-[#161B22] border border-white/5 rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:border-white/10 transition-all duration-300">
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-auto object-cover aspect-[2/3]"
                />
                <div className="p-2">
                  <h4 className="font-medium text-xs text-[#E5E7EB] line-clamp-2 mb-1">{movie.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-light text-[#9CA3AF]">{format(parseISO(movie.release_date), 'yyyy')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-xs font-medium ${getRatingColor(movie.vote_average)}`}>
                      ⭐ {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm font-light text-[#9CA3AF] mt-3">Carregando filmes recomendados...</p>
      )}
    </div>
  );
};

export default MovieRecommendations;
