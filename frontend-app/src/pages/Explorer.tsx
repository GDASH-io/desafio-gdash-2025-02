import { usePlanets } from "@/hooks/useSwapi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SideBar } from "@/components/SideBar"
import { ExplorerHeader, PlanetsTable, PaginationControls } from "@/components/explorer"

export const Explorer = () => {
  const { data, loading, page, setPage } = usePlanets()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <SideBar />
      <main className="flex-1 p-8 overflow-auto">
        <ExplorerHeader />
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
              <PlanetsTable planets={data?.results || []} />
            )}
            <PaginationControls page={page} loading={loading} hasNext={!!data?.next} setPage={setPage} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
