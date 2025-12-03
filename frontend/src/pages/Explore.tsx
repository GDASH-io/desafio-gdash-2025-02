import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Explore() {
    const [pokemons, setPokemons] = useState<any[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
    const [offset, setOffset] = useState(0);
    const navigate = useNavigate();

    const fetchPokemons = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/api/external/pokemons?limit=20&offset=${offset}`);
            setPokemons(res.data.results);
        } catch (error) {
            console.error("Erro ao buscar pokémons", error);
        }
    };

    const fetchDetail = async (name: string) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/external/pokemon/${name}`);
            setSelectedPokemon(res.data);
        } catch (error) {
            console.error("Erro ao buscar detalhes", error);
        }
    };

    useEffect(() => {
        fetchPokemons();
    }, [offset]);

    return (
        <div className="min-h-screen bg-transparent p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gradient">Explorar (PokéAPI)</h1>
                    <button onClick={() => navigate('/')} className="px-4 py-2 glass rounded-lg text-gray-700 hover:text-blue-600 hover:bg-white/80 transition-all font-medium">
                        Voltar ao Dashboard
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* List */}
                    <div className="col-span-1 glass-card rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Pokémons</h2>
                        <ul className="divide-y divide-gray-200/50 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {pokemons.map((p) => (
                                <li key={p.name} className="py-3 flex justify-between items-center hover:bg-white/40 rounded-lg px-2 transition-colors">
                                    <span className="capitalize font-medium text-gray-700">{p.name}</span>
                                    <button
                                        onClick={() => fetchDetail(p.name)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                                    >
                                        Ver
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 flex justify-between pt-4 border-t border-gray-200/50">
                            <button
                                disabled={offset === 0}
                                onClick={() => setOffset(Math.max(0, offset - 20))}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setOffset(offset + 20)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>

                    {/* Detail */}
                    <div className="col-span-2 glass-card rounded-2xl p-8 flex flex-col justify-center items-center min-h-[400px]">
                        {selectedPokemon ? (
                            <div className="text-center w-full max-w-md">
                                <h2 className="text-4xl font-bold capitalize mb-8 text-gradient">{selectedPokemon.name}</h2>
                                <div className="relative w-64 h-64 mx-auto mb-8">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-full opacity-50 blur-xl animate-pulse"></div>
                                    <img
                                        src={selectedPokemon.sprites.front_default}
                                        alt={selectedPokemon.name}
                                        className="relative w-full h-full object-contain z-10 drop-shadow-xl"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6 text-left bg-white/50 p-6 rounded-xl backdrop-blur-sm">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Altura</span>
                                        <span className="text-xl font-bold text-gray-800">{selectedPokemon.height}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Peso</span>
                                        <span className="text-xl font-bold text-gray-800">{selectedPokemon.weight}</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col">
                                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipos</span>
                                        <div className="flex gap-2">
                                            {selectedPokemon.types.map((type: string) => (
                                                <span key={type} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <div className="text-6xl mb-4">👈</div>
                                <p className="text-xl font-medium">Selecione um Pokémon para ver detalhes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
