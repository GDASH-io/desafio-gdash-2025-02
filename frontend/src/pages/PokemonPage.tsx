import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PokemonDetails {
  name: string;
  image: string;
  types: string[];
}

export default function PokemonPage() {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Modal
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchPokemons = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/pokemon?page=${pageNum}`);
      setPokemons(res.data.results || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (name: string) => {
    setLoadingDetails(true);
    setIsModalOpen(true);
    try {
      const res = await api.get(`/pokemon/${name}`);
      setSelectedPokemon(res.data);
    } catch (error) {
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchPokemons(1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between mb-8 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Pokédex Integrada
            </h1>
          </div>
          <Button variant="ghost" onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Search className="w-10 h-10 animate-bounce mb-2" />
            <p>Capturando dados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
            {pokemons.map((poke) => (
              <Card
                key={poke.name}
                // Removi o 'overflow-hidden' e 'relative' que não são mais essenciais sem o icone de fundo
                className="capitalize hover:shadow-xl transition-all cursor-pointer flex flex-col items-center p-6 bg-white border-slate-200 hover:border-yellow-400 group"
                onClick={() => handleCardClick(poke.name)}
              >
                {/* REMOVIDA A DIV DO RAIOZINHO AQUI */}

                <img
                  src={poke.image}
                  alt={poke.name}
                  // Ajustei levemente a sombra da imagem
                  className="w-32 h-32 object-contain mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                />
                <CardHeader className="p-0">
                  <CardTitle className="text-center text-lg font-bold text-slate-700 group-hover:text-yellow-600 transition-colors">
                    {poke.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Paginação */}
        <div className="flex justify-center gap-4 items-center bg-white p-4 rounded-full w-fit mx-auto shadow-sm border border-slate-200">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fetchPokemons(Number(page) - 1)}
            disabled={Number(page) <= 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-slate-600 min-w-[100px] text-center">
            Página {page} de {totalPages}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fetchPokemons(Number(page) + 1)}
            disabled={Number(page) >= totalPages}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal (Mantido igual) */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[400px] bg-white border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold capitalize text-center text-slate-800">
                {selectedPokemon?.name || "..."}
              </DialogTitle>
            </DialogHeader>

            {loadingDetails || !selectedPokemon ? (
              <div className="py-10 text-center text-slate-400">
                Carregando detalhes...
              </div>
            ) : (
              <div className="flex flex-col items-center pb-4">
                <div className="relative w-full flex justify-center mb-6 bg-slate-50 rounded-xl p-4 inner-shadow">
                  <img
                    src={selectedPokemon.image}
                    alt={selectedPokemon.name}
                    className="w-48 h-48 object-contain drop-shadow-lg"
                  />
                </div>

                <DialogDescription className="text-center mb-2 font-medium text-slate-500">
                  Tipos Elementais
                </DialogDescription>

                <div className="flex gap-2">
                  {selectedPokemon.types.map((type) => (
                    <Badge
                      key={type}
                      className="capitalize px-4 py-1 text-md bg-slate-800 hover:bg-slate-700"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
