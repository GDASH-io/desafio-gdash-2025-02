import { useState, useEffect } from 'react'
import axios from 'axios'
import { rickAndMortyApi, type Character } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Users, MapPin, Tv, Calendar } from 'lucide-react'

interface Episode {
  name: string
  air_date: string
  episode: string
}

const translateGender = (gender: string) => {
  const map: Record<string, string> = {
    Male: 'Masculino',
    Female: 'Feminino',
    Genderless: 'Sem gênero',
    unknown: 'Desconhecido',
  }
  return map[gender] || gender
}

const getStatusColor = (status: string) => {
  // Status já vem traduzido do backend
  switch (status) {
    case 'Vivo':
      return 'bg-green-500'
    case 'Morto':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export default function RickAndMorty() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)

  const fetchCharacters = async (pageNumber: number) => {
    setLoading(true)
    try {
      const response = await rickAndMortyApi.getCharacters(pageNumber)
      setCharacters(response.results)
      setTotalPages(response.info.pages)
    } catch (error) {
      console.error('Error fetching Rick and Morty data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacters(page)
  }, [page])

  useEffect(() => {
    if (selectedCharacter) {
      const fetchEpisodes = async () => {
        setLoadingEpisodes(true)
        setEpisodes([])
        try {
          // Fetch only the first 10 episodes to avoid overwhelming requests
          const episodeUrls = selectedCharacter.episode.slice(0, 10)
          const promises = episodeUrls.map(url => axios.get(url))
          const responses = await Promise.all(promises)
          setEpisodes(responses.map(r => ({
            name: r.data.name,
            air_date: r.data.air_date,
            episode: r.data.episode
          })))
        } catch (error) {
          console.error('Error fetching episodes:', error)
        } finally {
          setLoadingEpisodes(false)
        }
      }
      fetchEpisodes()
    }
  }, [selectedCharacter])

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1)
    }
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent w-fit">
            Rick and Morty
          </h1>
          <p className="text-muted-foreground mt-1">
            Explorador do Multiverso
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
          <Badge variant="outline" className="bg-background">
            Página {page} de {totalPages || '...'}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/50 shadow-sm">
              <Skeleton className="h-64 w-full" />
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {characters.map((character) => (
            <Card 
              key={character.id} 
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm overflow-hidden cursor-pointer"
              onClick={() => setSelectedCharacter(character)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={character.image} 
                  alt={character.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2">
                   <Badge className={`${getStatusColor(character.status)} text-white border-0`}>
                    {character.status}
                   </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl group-hover:text-primary transition-colors truncate">
                  {character.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{character.species}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{character.location.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePreviousPage}
          disabled={page === 1 || loading}
          className="w-32 group"
        >
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleNextPage}
          disabled={page >= totalPages || loading}
          className="w-32 group"
        >
          Próxima
          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <Dialog open={!!selectedCharacter} onOpenChange={(open) => !open && setSelectedCharacter(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {selectedCharacter?.name}
            </DialogTitle>
            <DialogDescription>
              Detalhes do personagem
            </DialogDescription>
          </DialogHeader>
          
          {selectedCharacter && (
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div className="aspect-square relative rounded-lg overflow-hidden border border-border shadow-md">
                  <img 
                    src={selectedCharacter.image}
                    alt={selectedCharacter.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(selectedCharacter.status)}`} />
                      <p className="text-base font-medium">{selectedCharacter.status}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Espécie</span>
                    <p className="text-base font-medium">{selectedCharacter.species}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Gênero</span>
                    <p className="text-base font-medium">{translateGender(selectedCharacter.gender)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Origem</span>
                    <p className="text-base font-medium truncate" title={selectedCharacter.origin.name}>
                      {selectedCharacter.origin.name}
                    </p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Localização Atual</span>
                    <p className="text-base font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {selectedCharacter.location.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                    <Tv className="h-4 w-4" /> Episódios Recentes
                  </h3>
                  {loadingEpisodes ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {episodes.map((ep, idx) => (
                        <li key={idx} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                          <div className="flex flex-col">
                            <span className="font-medium">{ep.name}</span>
                            <span className="text-xs text-muted-foreground">{ep.episode}</span>
                          </div>
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {ep.air_date}
                          </span>
                        </li>
                      ))}
                      {selectedCharacter.episode.length > 10 && (
                        <li className="text-xs text-center text-muted-foreground pt-2">
                          + {selectedCharacter.episode.length - 10} episódios
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
