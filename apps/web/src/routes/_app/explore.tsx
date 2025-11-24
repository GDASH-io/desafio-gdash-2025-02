import { PokemonListItemType } from '@repo/shared'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchPokemonById, fetchPokemonList } from '@/services/pokemon'

export const Route = createFileRoute('/_app/explore')({
  component: ExplorePage,
})

function ExplorePage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['pokemon', 'list', page, limit],
    queryFn: () => fetchPokemonList(page, limit),
  })

  const { data: detail } = useQuery({
    queryKey: ['pokemon', 'detail', selectedId],
    queryFn: () => fetchPokemonById(selectedId!),
    enabled: !!selectedId,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Explorar Pokemon</h1>

      {selectedId && detail ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="capitalize">{detail.name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex justify-center">
                <img
                  src={detail.sprites.front}
                  alt={detail.name}
                  className="h-48 w-48 object-contain"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-muted-foreground">Informações</h4>
                  <p>Altura: {detail.height / 10}m</p>
                  <p>Peso: {detail.weight / 10}kg</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Tipos</h4>
                  <div className="flex gap-2">
                    {detail.types.map((type) => (
                      <span
                        key={type}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm capitalize text-primary"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Habilidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {detail.abilities.map((ability) => (
                      <span key={ability} className="rounded bg-muted px-2 py-1 text-sm capitalize">
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Stats</h4>
                  <div className="space-y-2">
                    {detail.stats.map((stat) => (
                      <div key={stat.name} className="flex items-center gap-2">
                        <span className="w-32 text-sm capitalize">{stat.name}</span>
                        <div className="flex-1 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${Math.min(100, (stat.value / 150) * 100)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading ? (
            <div className="text-center">Carregando...</div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {data?.items.map((pokemon: PokemonListItemType) => (
                  <Card
                    key={pokemon.id}
                    className="cursor-pointer transition-shadow hover:shadow-lg"
                    onClick={() => setSelectedId(pokemon.id)}
                  >
                    <CardContent className="flex flex-col items-center p-4">
                      <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="h-24 w-24 object-contain"
                      />
                      <p className="mt-2 text-center font-medium capitalize">{pokemon.name}</p>
                      <p className="text-sm text-muted-foreground">#{pokemon.id}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {data?.meta.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (data?.meta.totalPages || 1)}
                >
                  Próxima
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1) }}>
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
            </>
          )}
        </>
      )}
    </div>
  )
}
