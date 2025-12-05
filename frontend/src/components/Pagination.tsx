// src/components/Pagination.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "./ui/button-group";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages?: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 mt-4 place-self-center">
        <ButtonGroup>
            <Button variant="outline" onClick={onPrev} disabled={page <= 1}>
                <ChevronLeft />
                Previous
            </Button>
            <Button variant="outline" onClick={onNext} disabled={typeof totalPages === "number" && page >= totalPages}>
                Next
                <ChevronRight />
            </Button>
        </ButtonGroup>
        <div className="text-sm text-slate-400">
        Página {page}{totalPages ? ` de ${totalPages}` : ""}
        </div>
    </div>
  );
}
