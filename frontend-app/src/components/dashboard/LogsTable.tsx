import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function LogsTable({ logs }: { logs?: any[] }) {
  return (
    <Card className="bg-card border-border h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-foreground">Histórico Recente</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pr-2 custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50 border-border">
              <TableHead className="text-muted-foreground">Hora</TableHead>
              <TableHead className="text-muted-foreground text-right">Temp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.slice(0, 15).map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/50 border-border">
                <TableCell className="text-foreground font-mono text-xs">
                  {new Date(log.collectedAt).toLocaleTimeString()}
                </TableCell>
                <TableCell className="text-right text-foreground font-bold">
                  {log.temperature}°
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
