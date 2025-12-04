import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  return (
    <div className="flex gap-2 justify-center mt-4">
      <Button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </Button>
      <span className="px-4 py-2">
        Página {page} de {totalPages}
      </span>
      <Button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </Button>
    </div>
  );
}
