import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Pokemon {
    name: string;
    url: string;
}

interface PokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Pokemon[];
}

export const PokemonPage: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 20;

    useEffect(() => {
        fetchPokemon();
    }, [offset]);

    const fetchPokemon = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/pokemon?limit=${limit}&offset=${offset}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar Pokémons');
            }

            const data: PokemonListResponse = await response.json();
            setPokemonList(data.results);
            setTotal(data.count);
        } catch (error) {
            console.error('Erro ao buscar pokemons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (offset + limit < total) {
            setOffset(offset + limit);
        }
    };

    const handlePrevious = () => {
        if (offset - limit >= 0) {
            setOffset(offset - limit);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center mb-8 gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                        PokéAPI Explorer
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                            {pokemonList.map((pokemon) => {
                                const id = pokemon.url.split('/').filter(Boolean).pop();
                                const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

                                return (
                                    <Card key={pokemon.name} className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-all duration-300 backdrop-blur-sm overflow-hidden group">
                                        <div className="p-4 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-slate-700/30 rounded-full mb-4 flex items-center justify-center group-hover:bg-yellow-500/10 transition-colors">
                                                <img
                                                    src={imageUrl}
                                                    alt={pokemon.name}
                                                    className="w-20 h-20 group-hover:scale-110 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <h3 className="text-lg font-bold capitalize text-slate-200 group-hover:text-yellow-400 transition-colors">
                                                {pokemon.name}
                                            </h3>
                                            <span className="text-xs text-slate-500 mt-1">#{id}</span>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <span className="text-slate-400 text-sm">
                                Mostrando {offset + 1}-{Math.min(offset + limit, total)} de {total}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handlePrevious}
                                    disabled={offset === 0}
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Anterior
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    disabled={offset + limit >= total}
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    Próximo
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
