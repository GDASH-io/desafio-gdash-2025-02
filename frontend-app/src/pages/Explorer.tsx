import { usePlanets } from "@/hooks/useSwapi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SideBar } from "@/components/SideBar"
import { ExplorerHeader, PlanetsTable, PaginationControls } from "@/components/explorer"

export const Explorer = () => {
  const { data, loading, page, setPage } = usePlanets()

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <SideBar />
      <main className="flex-1 p-8 overflow-auto">
        <ExplorerHeader />
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex justify-between">
              <span>Planetas Conhecidos</span>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">Página {page}</Badge>
            </CardTitle>
            <CardDescription>Dados recuperados de uma galáxia muito, muito distante.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-10 text-center text-muted-foreground animate-pulse">Viajando na velocidade da luz...</div>
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
