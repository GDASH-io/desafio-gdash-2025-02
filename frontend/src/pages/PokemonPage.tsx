import { Badge } from "@/components/ui/badge"; // Para os tipos ficarem bonitos
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
import { useEffect, useState } from "react";

// Tipagem simples para o detalhe
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

  // --- Estados para o Modal ---
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchPokemons = async (pageNum: number) => {
    setLoading(true);
    try {
      // Nota: Se vc implementou paginação no controller, ajuste aqui.
      // Se não, ele vai pegar sempre a página 1, mas funciona pro teste.
      const res = await api.get(`/pokemon`);
      // O service atual retorna { results: [], ... }
      setPokemons(res.data.results || []);
      // Se o seu controller não estiver retornando totalPages, remova a linha abaixo ou ajuste
      setTotalPages(res.data.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Função ao clicar no Card ---
  const handleCardClick = async (name: string) => {
    setLoadingDetails(true);
    setIsModalOpen(true); // Abre o modal carregando
    try {
      // Busca os detalhes (tipos) no backend
      const res = await api.get(`/pokemon/${name}`);
      setSelectedPokemon(res.data);
    } catch (error) {
      console.error("Erro ao buscar detalhes", error);
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchPokemons(1);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between mb-6 items-center">
          <h1 className="text-3xl font-bold text-slate-900">🐉 Pokédex</h1>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Voltar
          </Button>
        </div>

        {/* Lista de Cards */}
        {loading ? (
          <div className="text-center py-10">Carregando...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {pokemons.map((poke) => (
              <Card
                key={poke.name}
                className="capitalize hover:shadow-lg transition-all cursor-pointer flex flex-col items-center p-4 bg-white border-slate-200 hover:border-blue-300 group"
                onClick={() => handleCardClick(poke.name)}
              >
                <img
                  src={poke.image}
                  alt={poke.name}
                  className="w-28 h-28 object-contain mb-4 group-hover:scale-110 transition-transform"
                />
                <CardHeader className="p-0">
                  <CardTitle className="text-center text-lg font-bold text-slate-700">
                    {poke.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
        {/* Paginação Simples */}
        <div className="flex justify-center gap-4 items-center">
          <Button
            onClick={() => fetchPokemons(page - 1)}
            disabled={page <= 1}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-600">Página {page}</span>
          <Button
            onClick={() => fetchPokemons(page + 1)}
            disabled={totalPages <= 1}
            variant="outline"
          >
            Próxima
          </Button>
        </div>

        {/* --- MODAL DE DETALHES --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold capitalize text-center">
                {selectedPokemon?.name || "Carregando..."}
              </DialogTitle>
            </DialogHeader>

            {loadingDetails || !selectedPokemon ? (
              <div className="py-8 text-center">Buscando informações...</div>
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={selectedPokemon.image}
                  alt={selectedPokemon.name}
                  className="w-48 h-48 object-contain"
                />

                <DialogDescription className="text-center mb-4">
                  Tipos do Pokémon
                </DialogDescription>

                <div className="flex gap-2 mt-2">
                  {selectedPokemon.types.map((type) => (
                    // Usando Badge do Shadcn para ficar bonito
                    <Badge
                      key={type}
                      variant="secondary"
                      className="capitalize px-4 py-1 text-md"
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
