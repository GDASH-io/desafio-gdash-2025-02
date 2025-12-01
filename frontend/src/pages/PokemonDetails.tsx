import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pokemonService, { Pokemon } from '../services/pokemon.service';
import { Button } from '@/components/ui/button';
import { ArrowBigLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export function PokemonDetails() {
  const { id } = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadPokemon(id);
  }, [id]);

  const loadPokemon = async (pokemonId: string) => {
    try {
      setLoading(true);
      const data = await pokemonService.getPokemonById(pokemonId);
      setPokemon(data);
    } catch (error) {
      console.error('Erro ao carregar pokémon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (pokemon && pokemon.id > 1) {
      navigate(`/pokemon/${pokemon.id - 1}`);
    }
  };

  const handleNext = () => {
    if (pokemon) {
      navigate(`/pokemon/${pokemon.id + 1}`);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      electric: '#F8D030',
      psychic: '#F85888',
      ice: '#98D8D8',
      dragon: '#7038F8',
      dark: '#705848',
      fairy: '#EE99AC',
      normal: '#A8A878',
      fighting: '#C03028',
      flying: '#A890F0',
      poison: '#A040A0',
      ground: '#E0C068',
      rock: '#B8A038',
      bug: '#A8B820',
      ghost: '#705898',
      steel: '#B8B8D0',
    };
    return colors[type] || '#68A090';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Pokémon não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
    
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={handlePrevious}
            disabled={pokemon.id === 1}
            variant="outline"
          >
            <ChevronLeft className="mr-2" />
            Anterior
          </Button>

          <div className="text-white text-lg font-semibold">
            #{pokemon.id}
          </div>

          <Button 
            onClick={handleNext}
            variant="outline"
          >
            Próximo
            <ChevronRight className="ml-2" />
          </Button>
        </div>

        <div className="bg-gray-800 rounded-lg p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex justify-center items-center">
              <img
                src={pokemon.sprites.official_artwork}
                alt={pokemon.name}
                className="w-64 h-64 object-contain"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white capitalize mb-2">
                {pokemon.name}
              </h1>
              <p className="text-gray-400 text-xl mb-4">#{pokemon.id}</p>

              <div className="flex gap-2 mb-6">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className="px-4 py-2 rounded-full text-white font-semibold"
                    style={{ backgroundColor: getTypeColor(type) }}
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Informações</h3>
                  <div className="text-gray-300">
                    <p>Altura: {pokemon.height / 10}m</p>
                    <p>Peso: {pokemon.weight / 10}kg</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((ability) => (
                      <span
                        key={ability}
                        className="bg-gray-700 text-gray-300 px-3 py-1 rounded-lg capitalize"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Status Base</h3>
                  <div className="space-y-2">
                    {pokemon.stats.map((stat) => (
                      <div key={stat.name}>
                        <div className="flex justify-between text-gray-300 mb-1">
                          <span className="capitalize">{stat.name}</span>
                          <span>{stat.value}</span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(stat.value / 255) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      
        <div className="flex justify-center mt-6">
          <Button 
            onClick={() => navigate('/pokedex')}
            className="w-full md:w-auto"
          >
            <ArrowBigLeft className="mr-2" />
            Voltar para Pokédex
          </Button>
        </div>
      </div>
    </div>
  );
}