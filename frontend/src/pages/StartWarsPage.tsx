// src/pages/StarWarsPage.tsx
import { useEffect, useState } from "react";
import { starWarsService } from "@/services/starWarsService";
import type { StarWarsPerson, StarWarsPeopleResponse } from "@/interfaces/starWars";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StarWarsCard } from "@/components/layout/star-wars/StartWarsCard";
import AppHeader from "@/components/layout/AppHeader";

function StarWarsPage() {
  const [people, setPeople] = useState<StarWarsPerson[]>([]);
  const [page, setPage] = useState<number>(1);
  const [count, setCount] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const loadPeople = async (pageToLoad: number) => {
    try {
      setIsLoading(true);
      const data: StarWarsPeopleResponse = await starWarsService.listPeople(pageToLoad);
      setPeople(data.results);
      setCount(data.count);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
      setPage(pageToLoad);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar personagens de Star Wars");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPeople(1);
  }, []);

  const handleNext = () => {
    if (hasNext) loadPeople(page + 1);
  };

  const handlePrev = () => {
    if (hasPrev && page > 1) loadPeople(page - 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Aqui você pode passar as mesmas props do HomePage */}
      <AppHeader
        selectedCity="Brasília"
        onGenerateWeather={() => {}}
        isGeneratingWeather={false}
      />

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto w-full space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Personagens de Star Wars</h1>
            <p className="text-sm text-slate-400">
              Listagem paginada consumindo a API pública SWAPI.
            </p>
          </div>

          <div className="text-sm text-slate-300">
            Total conhecido pela API:{" "}
            <span className="font-semibold">{count}</span>
          </div>
        </header>

        {/* Paginação */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev || isLoading}
              onClick={handlePrev}
              className="cursor-pointer"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext || isLoading}
              onClick={handleNext}
              className="cursor-pointer"
            >
              Próxima
            </Button>
          </div>

          <span className="text-xs text-slate-400">
            Página {page}
          </span>
        </div>

        {/* Grid de cards */}
        {isLoading ? (
          <p className="text-sm text-slate-300">Carregando personagens...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <StarWarsCard key={person.url} person={person} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default StarWarsPage;
