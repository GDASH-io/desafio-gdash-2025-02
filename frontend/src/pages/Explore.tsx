import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface Pokemon {
  name: string;
  url: string;
}

const Explore = () => {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const navigate = useNavigate();

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/public-api/pokemon`, {
        params: { limit, offset },
      });
      setPokemon(response.data.results);
    } catch (error) {
      console.error('Failed to fetch pokemon', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, [offset]);

  const handleNext = () => setOffset((prev) => prev + limit);
  const handlePrev = () => setOffset((prev) => Math.max(0, prev - limit));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Explore Pokémon</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-100">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: limit }).map((_, i) => (
                <Card key={i} className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4 bg-slate-800" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full bg-slate-800" />
                  </CardContent>
                </Card>
              ))
            : pokemon.map((p) => (
                <Card key={p.name} className="bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="capitalize text-center text-slate-100">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.url.split('/')[6]}.png`}
                      alt={p.name}
                      className="w-24 h-24 drop-shadow-lg"
                    />
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={handlePrev} disabled={offset === 0 || loading} className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-800 disabled:text-slate-500">
            Previous
          </Button>
          <Button onClick={handleNext} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-800 disabled:text-slate-500">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Explore;
