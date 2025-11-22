import { usePlanets } from '@/hooks/useSwapi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, ChevronLeft, ChevronRight, Rocket } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const Explorer = () =>  {
  const { data, loading, page, setPage } = usePlanets()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/50">
                <Rocket className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">Explorador Galáctico</h1>
                <p className="text-slate-400">Integração SWAPI (Star Wars API) via NestJS</p>
            </div>
        </div>

        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white flex justify-between">
                    <span>Planetas Conhecidos</span>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">Página {page}</Badge>
                </CardTitle>
                <CardDescription>Dados recuperados de uma galáxia muito, muito distante.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="p-10 text-center text-slate-400 animate-pulse">Viajando na velocidade da luz...</div>
                ) : (
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
                            {data?.results?.map((planet: any) => (
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
                )}

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
                        onClick={() => setPage((old) => (!data || !data.next ? old : old + 1))}
                        disabled={!data?.next || loading}
                        className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
                    >
                        Próximo <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}