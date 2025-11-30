import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Ruler, Users, Gauge, DollarSign, Box } from "lucide-react";
import type { Starship } from "@/types/starWarsType";

interface StarshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  starship: Starship | null;
  isLoading: boolean;
}

export function StarshipModal({
  open,
  onOpenChange,
  starship,
  isLoading,
}: StarshipModalProps) {
  // Componente auxiliar para exibir campos com ícones
  const InfoItem = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
      <div className="p-2 bg-white rounded-full border border-zinc-200 shadow-sm">
        <Icon className="h-4 w-4 text-indigo-600" />
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium uppercase">{label}</p>
        <p className="text-sm font-semibold text-zinc-900">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Rocket className="h-5 w-5 text-indigo-600" />
            {starship?.name || "Detalhes da Nave"}
          </DialogTitle>
          <DialogDescription>
            {starship?.model} - {starship?.manufacturer}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : starship ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <InfoItem
              icon={DollarSign}
              label="Custo"
              value={`${starship.cost_in_credits} créditos`}
            />
            <InfoItem
              icon={Gauge}
              label="Velocidade Max."
              value={starship.max_atmosphering_speed}
            />
            <InfoItem icon={Users} label="Tripulação" value={starship.crew} />
            <InfoItem
              icon={Users}
              label="Passageiros"
              value={starship.passengers}
            />
            <InfoItem
              icon={Box}
              label="Carga"
              value={starship.cargo_capacity}
            />
            <InfoItem
              icon={Ruler}
              label="Comprimento"
              value={`${starship.length}m`}
            />

            <div className="col-span-1 md:col-span-2 mt-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <span className="text-xs font-bold text-indigo-800 uppercase">
                Classe:{" "}
              </span>
              <span className="text-sm text-indigo-900 capitalize">
                {starship.starship_class}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-zinc-500">
            Nenhuma informação disponível.
          </p>
        )}

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
