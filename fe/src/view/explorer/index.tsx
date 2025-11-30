import { ExplorerTableSkeleton } from "@/components/skeletons/ExplorerTableSkeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useExplorerController } from "./useExplorerController";

function Explorer() {
  const {
    currentPage,
    data,
    handleNextPage,
    handlePreviousPage,
    isLoading
  } = useExplorerController();

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-xl font-bold mb-4">Explore os Personagens de Star Wars</h2>
      {isLoading ? (
        <ExplorerTableSkeleton />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Altura</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Cor do Cabelo</TableHead>
              <TableHead>Cor da Pele</TableHead>
              <TableHead>Cor dos Olhos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.height}</TableCell>
                <TableCell>{item.mass} Kg</TableCell>
                <TableCell>{item.hair_color}</TableCell>
                <TableCell>{item.skin_color}</TableCell>
                <TableCell>{item.eye_color}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && data && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {data?.total_pages}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button size="sm" onClick={handleNextPage} disabled={!data?.has_next}>
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Explorer;
