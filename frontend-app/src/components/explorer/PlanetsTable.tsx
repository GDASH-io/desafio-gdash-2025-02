import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe } from "lucide-react"

interface PlanetsTableProps {
  planets: any[]
}

export function PlanetsTable({ planets }: PlanetsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-muted/50 border-border">
          <TableHead className="text-muted-foreground">Nome</TableHead>
          <TableHead className="text-muted-foreground">Clima</TableHead>
          <TableHead className="text-muted-foreground">Terreno</TableHead>
          <TableHead className="text-muted-foreground text-right">População</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {planets?.map((planet) => (
          <TableRow key={planet.name} className="hover:bg-muted/50 border-border group cursor-pointer">
            <TableCell className="font-medium text-foreground group-hover:text-yellow-400 transition-colors">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {planet.name}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground capitalize">{planet.climate}</TableCell>
            <TableCell className="text-muted-foreground capitalize">{planet.terrain}</TableCell>
            <TableCell className="text-right text-muted-foreground font-mono">
              {planet.population === 'unknown' ? '---' : Number(planet.population).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
