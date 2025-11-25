import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pokemonAPI } from "../api";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import "./Pokemon.css";

export default function Pokemon() {
  const [offset, setOffset] = useState(0);
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
  const limit = 20;

  const { data: pokemonList, isLoading } = useQuery({
    queryKey: ["pokemon", offset],
    queryFn: () => pokemonAPI.getList(limit, offset),
  });

  const { data: pokemonDetails } = useQuery({
    queryKey: ["pokemon", selectedPokemon],
    queryFn: () => pokemonAPI.getById(selectedPokemon!),
    enabled: !!selectedPokemon,
  });

  const handleNext = () => {
    if (pokemonList?.data.next) {
      setOffset(offset + limit);
    }
  };

  const handlePrevious = () => {
    if (offset >= limit) {
      setOffset(offset - limit);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={48} />
        <p>Carregando Pokémon...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="pokemon-header">
        <h1>Pokédex</h1>
        <p className="subtitle">Explore {pokemonList?.data.count} Pokémon</p>
      </div>

      <div className="pokemon-grid">
        {pokemonList?.data.results.map((pokemon: any) => (
          <div
            key={pokemon.id}
            className="pokemon-card"
            onClick={() => setSelectedPokemon(pokemon.id)}
          >
            <div className="pokemon-image">
              <img src={pokemon.image} alt={pokemon.name} />
            </div>
            <div className="pokemon-info">
              <span className="pokemon-id">
                #{String(pokemon.id).padStart(3, "0")}
              </span>
              <h3 className="pokemon-name">{pokemon.name}</h3>
              <div className="pokemon-types">
                {pokemon.types.map((type: string) => (
                  <span key={type} className={`type-badge type-${type}`}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={handlePrevious}
          disabled={offset === 0}
          className="btn btn-secondary"
        >
          <ChevronLeft size={20} />
          Anterior
        </button>
        <span className="page-info">
          {offset + 1} - {offset + limit} de {pokemonList?.data.count}
        </span>
        <button
          onClick={handleNext}
          disabled={!pokemonList?.data.next}
          className="btn btn-secondary"
        >
          Próximo
          <ChevronRight size={20} />
        </button>
      </div>

      {selectedPokemon && pokemonDetails && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedPokemon(null)}
            >
              ×
            </button>
            <div className="modal-header">
              <div className="modal-images">
                <img
                  src={pokemonDetails.data.image}
                  alt={pokemonDetails.data.name}
                />
                <img
                  src={pokemonDetails.data.imageShiny}
                  alt={`${pokemonDetails.data.name} shiny`}
                />
              </div>
              <div className="modal-info">
                <span className="pokemon-id">
                  #{String(pokemonDetails.data.id).padStart(3, "0")}
                </span>
                <h2>{pokemonDetails.data.name}</h2>
                <div className="pokemon-types">
                  {pokemonDetails.data.types.map((type: string) => (
                    <span key={type} className={`type-badge type-${type}`}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Informações</h3>
                <p>
                  <strong>Altura:</strong> {pokemonDetails.data.height / 10}m
                </p>
                <p>
                  <strong>Peso:</strong> {pokemonDetails.data.weight / 10}kg
                </p>
              </div>

              <div className="detail-section">
                <h3>Habilidades</h3>
                <div className="abilities-list">
                  {pokemonDetails.data.abilities.map((ability: string) => (
                    <span key={ability} className="ability-badge">
                      {ability}
                    </span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Estatísticas</h3>
                <div className="stats-list">
                  {pokemonDetails.data.stats.map((stat: any) => (
                    <div key={stat.name} className="stat-item">
                      <span className="stat-name">{stat.name}</span>
                      <div className="stat-bar">
                        <div
                          className="stat-fill"
                          style={{ width: `${(stat.value / 255) * 100}%` }}
                        />
                      </div>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
