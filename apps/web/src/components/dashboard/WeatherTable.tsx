import { WeatherLogType } from '@repo/shared'
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { conditionMap } from '@/lib/constants/weather'

type SortField = 'collectedAt' | 'temperature' | 'humidity' | 'windSpeed'

interface WeatherTableProps {
  logs: WeatherLogType[]
  page: number
  totalPages: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function WeatherTable({ logs, page, totalPages, limit, onPageChange, onLimitChange }: WeatherTableProps) {
  const [sortField, setSortField] = useState<SortField>('collectedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [conditionFilter, setConditionFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const availableConditions = [...new Set(logs.map((log) => log.condition))]

  const filteredAndSortedLogs = logs
    .filter((log) => conditionFilter === 'all' || log.condition === conditionFilter)
    .sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (sortField === 'collectedAt') {
        return sortOrder === 'desc'
          ? new Date(bVal as string).getTime() - new Date(aVal as string).getTime()
          : new Date(aVal as string).getTime() - new Date(bVal as string).getTime()
      }
      return sortOrder === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number)
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === 'desc' ? <ArrowDownAZ className="ml-1 h-3 w-3" /> : <ArrowUpAZ className="ml-1 h-3 w-3" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Registros Recentes</CardTitle>
            <CardDescription>Últimas medições coletadas pelo sistema</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-fit"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="space-y-2">
              <Label>Condição climática</Label>
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas as condições" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as condições</SelectItem>
                  {availableConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {conditionMap[condition]?.label || condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {conditionFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConditionFilter('all')}
                className="h-10"
              >
                <X className="mr-1 h-4 w-4" />
                Limpar filtro
              </Button>
            )}
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('collectedAt')}
              >
                <div className="flex items-center">
                  Data/Hora
                  <SortIcon field="collectedAt" />
                </div>
              </TableHead>
              <TableHead>Local</TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('temperature')}
              >
                <div className="flex items-center">
                  Temp.
                  <SortIcon field="temperature" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('humidity')}
              >
                <div className="flex items-center">
                  Umidade
                  <SortIcon field="humidity" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort('windSpeed')}
              >
                <div className="flex items-center">
                  Vento
                  <SortIcon field="windSpeed" />
                </div>
              </TableHead>
              <TableHead>Condição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {new Date(log.collectedAt).toLocaleString('pt-BR')}
                </TableCell>
                <TableCell>{log.location}</TableCell>
                <TableCell>
                  <span className={`font-medium ${log.temperature > 30 ? 'text-red-600' : log.temperature < 15 ? 'text-blue-600' : ''}`}>
                    {log.temperature.toFixed(1)}°C
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, log.humidity)}%` }}
                      />
                    </div>
                    <span>{log.humidity.toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell>{log.windSpeed.toFixed(1)} km/h</TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${conditionMap[log.condition]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {conditionMap[log.condition]?.label || log.condition}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {filteredAndSortedLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Próxima
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <Select value={limit.toString()} onValueChange={(v) => onLimitChange(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
