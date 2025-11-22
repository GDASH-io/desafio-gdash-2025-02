import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function LogsTable({ logs }: { logs?: any[] }) {
  return (
    <Card className="bg-slate-900 border-slate-800 h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-slate-100">Histórico Recente</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pr-2 custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-slate-800 border-slate-800">
              <TableHead className="text-slate-400">Hora</TableHead>
              <TableHead className="text-slate-400 text-right">Temp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.slice(0, 15).map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-800 border-slate-800">
                <TableCell className="text-slate-300 font-mono text-xs">
                  {new Date(log.collectedAt).toLocaleTimeString()}
                </TableCell>
                <TableCell className="text-right text-slate-300 font-bold">
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
