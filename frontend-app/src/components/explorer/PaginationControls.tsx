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
    <div className="flex items-center justify-center gap-4 mt-8 pb-8">
      <Button
        variant="outline"
        onClick={() => setPage((old) => Math.max(old - 1, 1))}
        disabled={page === 1 || loading}
        className="rounded-full px-6 py-6 border-yellow-400 text-yellow-400 bg-slate-900 hover:bg-yellow-400 hover:text-black transition-all duration-300 disabled:opacity-50"
      >
        <ChevronLeft className="h-5 w-5 mr-2" /> Anterior
      </Button>
      
      <span className="text-xl font-bold text-yellow-400">
        Página {page}
      </span>

      <Button
        variant="outline"
        onClick={() => setPage((old) => (!hasNext ? old : old + 1))}
        disabled={!hasNext || loading}
        className="rounded-full px-6 py-6 border-yellow-400 text-yellow-400 bg-slate-900 hover:bg-yellow-400 hover:text-black transition-all duration-300 disabled:opacity-50"
      >
        Próxima <ChevronRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  )
}