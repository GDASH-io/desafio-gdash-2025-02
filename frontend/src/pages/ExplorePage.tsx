import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { usePokemonList, usePokemon } from '@/hooks/usePokemon'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

export const ExplorePage = () => {
    const [page, setPage] = useState(0)
    const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null)

    const { data: pokemonList, isLoading } = usePokemonList(page)
    const { data: pokemonDetails } = usePokemon(selectedPokemon || '')

    const totalPages = pokemonList ? Math.ceil(pokemonList.count / 20) : 0

    const extractIdFromUrl = (url: string) => {
        const parts = url.split('/')
        return parts[parts.length - 2]
    }

    if (isLoading) {
        return <LoadingSpinner size="lg" />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold font-hand text-primary">Explorar Pokémon</h1>
                <p className="text-muted-foreground mt-1">
                    Descubra Pokémon usando a PokéAPI pública
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {pokemonList?.results.map((pokemon) => {
                    const pokemonId = extractIdFromUrl(pokemon.url)
                    return (
                        <Card
                            key={pokemon.name}
                            className="sketch-card hover:shadow-sketch-lg transition-all cursor-pointer hover:scale-105"
                            onClick={() => setSelectedPokemon(pokemon.name)}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-center mb-2">
                                    <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                                        alt={pokemon.name}
                                        className="w-24 h-24"
                                    />
                                </div>
                                <CardTitle className="text-center font-hand capitalize">
                                    {pokemon.name}
                                </CardTitle>
                                <CardDescription className="text-center">
                                    #{pokemonId.padStart(3, '0')}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )
                })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                </Button>

                <span className="text-sm text-muted-foreground">
                    Página {page + 1} de {totalPages}
                </span>

                <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            {/* Pokemon Detail Dialog */}
            <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-hand capitalize text-2xl">
                            {pokemonDetails?.name}
                        </DialogTitle>
                        <DialogDescription>Detalhes do Pokémon</DialogDescription>
                    </DialogHeader>
                    {pokemonDetails && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <img
                                    src={pokemonDetails.sprites?.front_default}
                                    alt={pokemonDetails.name}
                                    className="w-48 h-48"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Card className="sketch-card">
                                    <CardHeader className="pb-2">
                                        <CardDescription>Altura</CardDescription>
                                        <CardTitle className="font-hand">
                                            {(pokemonDetails.height || 0) / 10}m
                                        </CardTitle>
                                    </CardHeader>
                                </Card>

                                <Card className="sketch-card">
                                    <CardHeader className="pb-2">
                                        <CardDescription>Peso</CardDescription>
                                        <CardTitle className="font-hand">
                                            {(pokemonDetails.weight || 0) / 10}kg
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Tipos</h3>
                                <div className="flex gap-2">
                                    {pokemonDetails.types?.map((type) => (
                                        <span
                                            key={type.type.name}
                                            className="px-3 py-1 rounded-full bg-primary/20 text-primary font-medium text-sm capitalize"
                                        >
                                            {type.type.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
