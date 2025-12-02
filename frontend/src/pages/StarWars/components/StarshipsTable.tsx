import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Starship } from "@/types/starWarsType";

interface StarshipsTableProps {
  starships: Starship[];
  loading: boolean;
  onViewDetails: (url: string) => void;
}

export function StarshipsTable({
  starships,
  loading,
  onViewDetails,
}: StarshipsTableProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80">
            <TableHead>Nome</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Fabricante</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <span>Carregando dados da galáxia...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : starships.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                Nenhuma nave encontrada.
              </TableCell>
            </TableRow>
          ) : (
            starships.map((ship) => (
              <TableRow
                key={ship.url}
                className="hover:bg-zinc-50 transition-colors"
              >
                <TableCell className="font-medium text-zinc-900">
                  {ship.name}
                </TableCell>
                <TableCell className="text-zinc-600">
                  <Badge variant="outline" className="font-normal bg-zinc-50">
                    {ship.model}
                  </Badge>
                </TableCell>
                <TableCell
                  className="text-zinc-500 text-sm truncate max-w-[200px]"
                  title={ship.manufacturer}
                >
                  {ship.manufacturer}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    onClick={() => onViewDetails(ship.url)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
