import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function HeaderActions({ exportLogs, loadingExport }: { 
  exportLogs: (type: string) => void, 
  loadingExport: boolean 
}) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer" 
        onClick={() => exportLogs('csv')} 
        disabled={loadingExport}
      >
        <Download className="mr-2 h-4 w-4" /> CSV
      </Button>
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" 
        onClick={() => exportLogs('xlsx')} 
        disabled={loadingExport}
      >
        <Download className="mr-2 h-4 w-4" /> Excel
      </Button>
    </div>
  )
}
