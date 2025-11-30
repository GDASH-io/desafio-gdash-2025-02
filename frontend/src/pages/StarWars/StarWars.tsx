import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarshipModal } from "./components/StarshipModal";
import { StarshipsTable } from "./components/StarshipsTable";
import { StarWarsHeader } from "./components/StarWarsHeader";
import { useStarWars } from "./hooks/useStarWars";

export default function StarWarsPage() {
  // Toda a lógica e estado vêm daqui do custom hook
  const { data, ui, actions } = useStarWars();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <StarWarsHeader />

      {/* Tabela */}
      <StarshipsTable
        starships={data.starships}
        loading={ui.loading}
        onViewDetails={actions.viewDetails}
      />

      {/* Paginação */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
        <span className="text-sm text-zinc-500 font-medium">
          Página <span className="text-zinc-900 font-bold">{ui.page}</span> de{" "}
          {data.totalPages}
        </span>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={actions.prevPage}
            disabled={ui.page === 1 || ui.loading}
            className="select-none"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={actions.nextPage}
            disabled={ui.page === data.totalPages || ui.loading}
            className="select-none"
          >
            Próximo <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <StarshipModal
        open={ui.isModalOpen}
        onOpenChange={actions.setIsModalOpen}
        starship={data.selectedStarship}
        isLoading={ui.loadingDetails}
      />
    </div>
  );
}
