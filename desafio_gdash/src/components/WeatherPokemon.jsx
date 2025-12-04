import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const WeatherPokemon = ({ weatherData }) => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLegendary, setIsLegendary] = useState(false);
  const navigate = useNavigate();

  // Mapeamento de condições climáticas para Pokémon
  const weatherPokemonMap = {
    // Temperatura muito alta (>30°C) - Fire types
    hot: [
      { name: 'charizard', legendary: false },
      { name: 'vulpix', legendary: false },
      { name: 'torkoal', legendary: false },
      { name: 'typhlosion', legendary: false },
      { name: 'blaziken', legendary: false },
      { name: 'moltres', legendary: true }, // Lendário raro
    ],
    // Chuva - Water types
    rain: [
      { name: 'squirtle', legendary: false },
      { name: 'psyduck', legendary: false },
      { name: 'lotad', legendary: false },
      { name: 'mudkip', legendary: false },
      { name: 'piplup', legendary: false },
      { name: 'kyogre', legendary: true }, // Lendário raro
    ],
    // Tempestade - Electric types
    storm: [
      { name: 'pikachu', legendary: false },
      { name: 'raichu', legendary: false },
      { name: 'electrike', legendary: false },
      { name: 'luxray', legendary: false },
      { name: 'ampharos', legendary: false },
      { name: 'zapdos', legendary: true }, // Lendário raro
    ],
    // Frio (<10°C) - Ice types
    cold: [
      { name: 'glaceon', legendary: false },
      { name: 'snorunt', legendary: false },
      { name: 'spheal', legendary: false },
      { name: 'bergmite', legendary: false },
      { name: 'swinub', legendary: false },
      { name: 'articuno', legendary: true }, // Lendário raro
    ],
    // Vento forte (>30 km/h) - Flying types
    windy: [
      { name: 'pidgeot', legendary: false },
      { name: 'swellow', legendary: false },
      { name: 'staraptor', legendary: false },
      { name: 'braviary', legendary: false },
      { name: 'talonflame', legendary: false },
      { name: 'lugia', legendary: true }, // Lendário raro
    ],
    // Neblina - Ghost types
    foggy: [
      { name: 'gastly', legendary: false },
      { name: 'misdreavus', legendary: false },
      { name: 'duskull', legendary: false },
      { name: 'litwick', legendary: false },
      { name: 'phantump', legendary: false },
      { name: 'giratina', legendary: true }, // Lendário raro
    ],
    // Nublado/Normal - Normal types
    cloudy: [
      { name: 'eevee', legendary: false },
      { name: 'castform', legendary: false },
      { name: 'teddiursa', legendary: false },
      { name: 'skitty', legendary: false },
      { name: 'minccino', legendary: false },
    ],
    // Ensolarado - Grass types
    sunny: [
      { name: 'bulbasaur', legendary: false },
      { name: 'chikorita', legendary: false },
      { name: 'sunkern', legendary: false },
      { name: 'roselia', legendary: false },
      { name: 'cherrim', legendary: false },
      { name: 'celebi', legendary: true }, // Lendário raro
    ],
  };

  const determineWeatherCondition = (data) => {
    if (!data) return 'cloudy';

    const temp = data.temperature;
    const windSpeed = data.wind_speed;
    const condition = data.condition?.toLowerCase() || '';

    // Prioridade: condições especiais > temperatura extrema > vento > condição geral
    if (condition.includes('tempestade') || condition.includes('storm')) {
      return 'storm';
    }
    if (condition.includes('neblina') || condition.includes('fog')) {
      return 'foggy';
    }
    if (condition.includes('chuva') || condition.includes('rain')) {
      return 'rain';
    }
    if (temp > 30) {
      return 'hot';
    }
    if (temp < 10) {
      return 'cold';
    }
    if (windSpeed > 30) {
      return 'windy';
    }
    if (
      condition.includes('ensolarado') ||
      condition.includes('sunny') ||
      condition.includes('clear')
    ) {
      return 'sunny';
    }
    if (
      condition.includes('nublado') ||
      condition.includes('cloudy') ||
      condition.includes('overcast')
    ) {
      return 'cloudy';
    }

    return 'cloudy';
  };

  const fetchPokemon = async (pokemonName, legendary) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/pokemon/${pokemonName}`);
      setPokemon(response.data);
      setIsLegendary(legendary);
    } catch (error) {
      console.error('Erro ao buscar Pokémon:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (weatherData) {
      const condition = determineWeatherCondition(weatherData);

      const pokemonList = weatherPokemonMap[condition] || weatherPokemonMap.cloudy;

      let legendaryChance = 0.02;
      if (weatherData.temperature > 35 || weatherData.temperature < 5) legendaryChance += 0.03;
      if (weatherData.wind_speed > 50) legendaryChance += 0.03;
      if (condition === 'storm') legendaryChance += 0.05;

      const shouldShowLegendary = Math.random() < legendaryChance;

      let selectedPokemon;
      if (shouldShowLegendary) {
        const legendaries = pokemonList.filter((p) => p.legendary);
        if (legendaries.length > 0) {
          selectedPokemon = legendaries[Math.floor(Math.random() * legendaries.length)];
          selectedPokemon = { ...selectedPokemon, isLegendary: true };
        } else {
          const normalPokemon = pokemonList.filter((p) => !p.legendary);
          selectedPokemon = normalPokemon[Math.floor(Math.random() * normalPokemon.length)];
          selectedPokemon = { ...selectedPokemon, isLegendary: false };
        }
      } else {
        const normalPokemon = pokemonList.filter((p) => !p.legendary);
        selectedPokemon = normalPokemon[Math.floor(Math.random() * normalPokemon.length)];
        selectedPokemon = { ...selectedPokemon, isLegendary: false };
      }

      fetchPokemon(selectedPokemon.name, selectedPokemon.isLegendary);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData]);

  const getConditionText = (data) => {
    if (!data) return 'Clima desconhecido';
    const condition = determineWeatherCondition(data);
    const texts = {
      hot: '🔥 Calor intenso',
      rain: '🌧️ Chuva',
      storm: '⛈️ Tempestade',
      cold: '❄️ Frio',
      windy: '💨 Muito vento',
      foggy: '🌫️ Neblina',
      cloudy: '☁️ Nublado',
      sunny: '☀️ Ensolarado',
    };
    return texts[condition] || 'Clima agradável';
  };

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

  if (loading || !pokemon) {
    return (
      <Card className="col-span-full lg:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`col-span-full lg:col-span-2 cursor-pointer transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${
        isLegendary
          ? 'bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-100 dark:from-yellow-900 dark:via-yellow-950 dark:to-orange-900 ring-2 ring-yellow-400 dark:ring-yellow-600'
          : 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950'
      }`}
      onClick={() => navigate(`/explore/${pokemon.name}`)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles
              className={`h-5 w-5 ${
                isLegendary
                  ? 'text-yellow-600 dark:text-yellow-400 animate-pulse'
                  : 'text-purple-600'
              }`}
            />
            <span className={isLegendary ? 'text-yellow-700 dark:text-yellow-300' : ''}>
              Pokémon Climático
            </span>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-500" />
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{getConditionText(weatherData)}</p>
      </CardHeader>

      <CardContent>
        <div className="flex items-center space-x-6">
          {/* Pokémon Image */}
          <div className={`relative flex-shrink-0 ${isLegendary ? 'animate-pulse' : ''}`}>
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden ${
                isLegendary
                  ? 'bg-gradient-to-br from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <img
                src={
                  pokemon.sprites?.other?.['official-artwork']?.front_default ||
                  pokemon.sprites?.front_default
                }
                alt={pokemon.name}
                className="w-full h-full object-contain p-2"
              />
            </div>
            {isLegendary && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-2 animate-bounce">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Pokémon Info */}
          <div className="flex-1">
            {isLegendary && (
              <div className="mb-2 inline-block">
                <span className="text-xs font-bold bg-yellow-500 text-white px-3 py-1 rounded-full animate-pulse">
                  ✨ LENDÁRIO RARO ✨
                </span>
              </div>
            )}

            <div className="flex items-baseline space-x-2 mb-2">
              <span
                className={`text-sm font-bold ${
                  isLegendary
                    ? 'text-yellow-700 dark:text-yellow-400'
                    : 'text-purple-600 dark:text-purple-400'
                }`}
              >
                #{pokemon.id.toString().padStart(3, '0')}
              </span>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                {pokemon.name}
              </h3>
            </div>

            {/* Types */}
            <div className="flex flex-wrap gap-2 mb-3">
              {pokemon.types?.map((type) => (
                <span
                  key={type.type.name}
                  className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getTypeColor(
                    type.type.name
                  )}`}
                >
                  {type.type.name.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {isLegendary
                ? '🌟 Um Pokémon Lendário extremamente raro apareceu devido às condições climáticas extremas!'
                : `Este Pokémon aparece quando o clima está ${getConditionText(
                    weatherData
                  ).toLowerCase()}.`}
            </p>

            {/* Stats Preview */}
            <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-semibold">HP:</span> {pokemon.stats?.[0]?.base_stat}
              </div>
              <div>
                <span className="font-semibold">ATK:</span> {pokemon.stats?.[1]?.base_stat}
              </div>
              <div>
                <span className="font-semibold">DEF:</span> {pokemon.stats?.[2]?.base_stat}
              </div>
            </div>

            <div className="mt-3 text-xs text-purple-600 dark:text-purple-400 flex items-center space-x-1">
              <ExternalLink className="h-3 w-3" />
              <span>Clique para ver detalhes completos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherPokemon;
