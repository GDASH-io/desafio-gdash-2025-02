import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Heart,
  Zap,
  Shield,
  Swords,
  Activity,
  Target,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/api/pokemon/${id}`);
        setPokemon(response.data);
      } catch (err) {
        console.error('Erro ao buscar detalhes do Pokémon:', err);
        setError('Erro ao carregar detalhes. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [id]);

  const getTypeColor = (type) => {
    const colors = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-cyan-400',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-lime-500',
      rock: 'bg-yellow-700',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-700',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300',
    };
    return colors[type] || 'bg-gray-400';
  };

  const getStatIcon = (statName) => {
    const icons = {
      hp: Heart,
      attack: Swords,
      defense: Shield,
      'special-attack': Zap,
      'special-defense': Target,
      speed: Activity,
    };
    return icons[statName] || Activity;
  };

  const getStatColor = (value) => {
    if (value >= 100) return 'text-green-600 dark:text-green-400';
    if (value >= 70) return 'text-blue-600 dark:text-blue-400';
    if (value >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Carregando detalhes...
          </p>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erro ao Carregar</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/explore')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button variant="outline" onClick={() => navigate('/explore')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista
        </Button>

        {/* Main Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Pokemon Image */}
              <div className="flex-shrink-0">
                <div className="w-64 h-64 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-2xl">
                  <img
                    src={
                      pokemon.sprites?.other?.['official-artwork']?.front_default ||
                      pokemon.sprites?.front_default
                    }
                    alt={pokemon.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              </div>

              {/* Pokemon Info */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  #{pokemon.id.toString().padStart(3, '0')}
                </p>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white capitalize mb-4">
                  {pokemon.name}
                </h1>

                {/* Types */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {pokemon.types?.map((type) => (
                    <span
                      key={type.type.name}
                      className={`px-4 py-2 rounded-full text-white font-semibold ${getTypeColor(
                        type.type.name
                      )}`}
                    >
                      {type.type.name.toUpperCase()}
                    </span>
                  ))}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Altura</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {pokemon.height / 10} m
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Peso</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {pokemon.weight / 10} kg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Stats */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Estatísticas Base
              </h2>
              <div className="space-y-4">
                {pokemon.stats?.map((stat) => {
                  const Icon = getStatIcon(stat.stat.name);
                  const percentage = (stat.base_stat / 255) * 100;

                  return (
                    <div key={stat.stat.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {stat.stat.name.replace('-', ' ')}
                          </span>
                        </div>
                        <span className={`text-lg font-bold ${getStatColor(stat.base_stat)}`}>
                          {stat.base_stat}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            stat.base_stat >= 100
                              ? 'bg-green-500'
                              : stat.base_stat >= 70
                                ? 'bg-blue-500'
                                : stat.base_stat >= 40
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Stats */}
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Abilities */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Habilidades</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pokemon.abilities?.map((ability) => (
                  <Card
                    key={ability.ability.name}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30"
                  >
                    <CardContent className="p-4">
                      <p className="font-semibold text-gray-800 dark:text-white capitalize">
                        {ability.ability.name.replace('-', ' ')}
                      </p>
                      {ability.is_hidden && (
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          (Habilidade Oculta)
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sprites */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Sprites</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pokemon.sprites?.front_default && (
                  <Card>
                    <CardContent className="p-4">
                      <img src={pokemon.sprites.front_default} alt="Front" className="w-full" />
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Frente
                      </p>
                    </CardContent>
                  </Card>
                )}
                {pokemon.sprites?.back_default && (
                  <Card>
                    <CardContent className="p-4">
                      <img src={pokemon.sprites.back_default} alt="Back" className="w-full" />
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Costas
                      </p>
                    </CardContent>
                  </Card>
                )}
                {pokemon.sprites?.front_shiny && (
                  <Card>
                    <CardContent className="p-4">
                      <img src={pokemon.sprites.front_shiny} alt="Shiny Front" className="w-full" />
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                        ✨ Frente Shiny
                      </p>
                    </CardContent>
                  </Card>
                )}
                {pokemon.sprites?.back_shiny && (
                  <Card>
                    <CardContent className="p-4">
                      <img src={pokemon.sprites.back_shiny} alt="Shiny Back" className="w-full" />
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                        ✨ Costas Shiny
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PokemonDetail;
