import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe } from "lucide-react"

interface PlanetsTableProps {
  planets: any[]
}

export function PlanetsTable({ planets }: PlanetsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-slate-800 border-slate-800">
          <TableHead className="text-slate-400">Nome</TableHead>
          <TableHead className="text-slate-400">Clima</TableHead>
          <TableHead className="text-slate-400">Terreno</TableHead>
          <TableHead className="text-slate-400 text-right">População</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {planets?.map((planet) => (
          <TableRow key={planet.name} className="hover:bg-slate-800 border-slate-800 group cursor-pointer">
            <TableCell className="font-medium text-white group-hover:text-yellow-400 transition-colors">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-500" />
                {planet.name}
              </div>
            </TableCell>
            <TableCell className="text-slate-300 capitalize">{planet.climate}</TableCell>
            <TableCell className="text-slate-300 capitalize">{planet.terrain}</TableCell>
            <TableCell className="text-right text-slate-300 font-mono">
              {planet.population === 'unknown' ? '---' : Number(planet.population).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
