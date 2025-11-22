import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlsProps {
  page: number
  loading: boolean
  hasNext: boolean
  setPage: (fn: (old: number) => number) => void
}

export function PaginationControls({ page, loading, hasNext, setPage }: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-slate-800">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage((old) => Math.max(old - 1, 1))}
        disabled={page === 1 || loading}
        className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
      >
        <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage((old) => (!hasNext ? old : old + 1))}
        disabled={!hasNext || loading}
        className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
      >
        Próximo <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}
