import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  changePage: (page: number) => void;
  nameItem: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  changePage,
  nameItem,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-between p-4 border-t bg-white rounded-b-md">
      <div className="text-sm text-gray-600">
        Total de {totalItems} {nameItem}.
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => changePage(currentPage - 1)}
          disabled={isFirstPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => changePage(currentPage + 1)}
          disabled={isLastPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
