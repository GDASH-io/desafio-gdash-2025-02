import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

const typeColors = {
  normal: "bg-gray-300 dark:bg-gray-700",
  fire: "bg-red-400 dark:bg-red-600",
  water: "bg-blue-400 dark:bg-blue-600",
  electric: "bg-yellow-300 dark:bg-yellow-500",
  grass: "bg-green-400 dark:bg-green-600",
  ice: "bg-blue-200 dark:bg-blue-400",
  fighting: "bg-red-600 dark:bg-red-800",
  poison: "bg-purple-400 dark:bg-purple-600",
  ground: "bg-yellow-600 dark:bg-yellow-800",
  flying: "bg-indigo-300 dark:bg-indigo-500",
  psychic: "bg-pink-400 dark:bg-pink-600",
  bug: "bg-green-300 dark:bg-green-600",
  rock: "bg-gray-400 dark:bg-gray-700",
  ghost: "bg-purple-600 dark:bg-purple-800",
  dragon: "bg-indigo-500 dark:bg-indigo-800",
  dark: "bg-gray-800 dark:bg-black",
  steel: "bg-gray-500 dark:bg-gray-700",
  fairy: "bg-pink-300 dark:bg-pink-500",
};

export default function PokemonPage() {
  const { theme } = useTheme();
  const [pokemons, setPokemons] = useState([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonDetail, setPokemonDetail] = useState(null);

  const fetchPokemons = async (pageNumber = 1) => {
    setLoading(true);
    const res = await fetch(`http://localhost:3000/api/pokemon?page=${pageNumber}`);
    const data = await res.json();
    setPokemons(data.results);
    setNextPage(data.next ? pageNumber + 1 : null);
    setPrevPage(data.previous ? pageNumber - 1 : null);
    setLoading(false);
  };

  const fetchPokemonDetail = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    setPokemonDetail(data);
  };

  useEffect(() => {
    fetchPokemons(page);
  }, [page]);

  useEffect(() => {
    if (selectedPokemon) fetchPokemonDetail(selectedPokemon.url);
    else setPokemonDetail(null);
  }, [selectedPokemon]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1
        className={`text-4xl font-extrabold text-center mb-8 ${
          theme === "light" ? "text-gray-900" : "text-white"
        }`}
      >
        Pokédex Animada
      </h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6"
      >
        {loading ? (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
            Carregando...
          </p>
        ) : (
          pokemons.map((pokemon, index) => (
            <motion.div
              key={pokemon.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedPokemon(pokemon)}
              className={`rounded-xl p-4 cursor-pointer shadow transition ${
                theme === "light"
                  ? "bg-blue-50 text-gray-900 hover:bg-blue-100"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              <h2 className="text-center font-semibold capitalize mb-2">
                {pokemon.name}
              </h2>
              <motion.img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${
                  pokemon.url.split("/")[6]
                }.gif`}
                alt={pokemon.name}
                className="w-20 h-20 mx-auto"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => prevPage && setPage(prevPage)}
          disabled={!prevPage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition"
        >
          Anterior
        </button>
        <button
          onClick={() => nextPage && setPage(nextPage)}
          disabled={!nextPage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition"
        >
          Próximo
        </button>
      </div>

      {pokemonDetail && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-10 rounded-xl p-6 shadow-xl flex flex-col items-center space-y-4 transition ${
            theme === "light"
              ? "bg-blue-50 text-gray-900"
              : "bg-gray-800 text-white"
          }`}
        >
          <h2 className="text-2xl font-bold capitalize">{pokemonDetail.name}</h2>

          <motion.img
            src={pokemonDetail.sprites.front_default}
            alt={pokemonDetail.name}
            className="w-32 h-32"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />

          <div className="flex space-x-4">
            <p>Altura: {(pokemonDetail.height * 0.1).toFixed(1)} m</p>
            <p>Peso: {(pokemonDetail.weight * 0.1).toFixed(1)} kg</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {pokemonDetail.types.slice(0, 2).map((t) => (
              <span
                key={t.type.name}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  typeColors[t.type.name] || "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                {t.type.name}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
