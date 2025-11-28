import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '../components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useExplorer } from '../hooks/useExplorer';

export function Explorer() {
    const {
        pokemons,
        loading,
        listError,
        page,
        totalPages,
        count,
        detail,
        detailLoading,
        detailError,
        previousPage,
        nextPage,
        fetchDetail
        ,
        clearDetail
    } = useExplorer(12);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeName, setActiveName] = useState<string | null>(null);

    const handleOpen = (name: string) => {
        setActiveName(name);
        setDialogOpen(true);
        fetchDetail(name);
    };

    useEffect(() => {
        if (!dialogOpen) {
            clearDetail();
            setActiveName(null);
        }
    }, [dialogOpen, clearDetail]);

    return (
        <div className="space-y-6">
            <Card className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-lg font-semibold text-[var(--text)]">Explorar PokeAPI</p>
                        <p className="text-sm text-[var(--muted)]">Listagem paginada de Pokemons com detalhes.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Button variant="ghost" size="sm" onClick={previousPage} disabled={page <= 1 || loading}>
                            Anterior
                        </Button>
                        <p>
                            {page} / {totalPages} ({count} itens)
                        </p>
                        <Button variant="ghost" size="sm" onClick={nextPage} disabled={page >= totalPages || loading}>
                            Proxima
                        </Button>
                    </div>
                </div>

                {listError && <p className="text-sm text-red-500">{listError}</p>}

                <div className="overflow-x-auto">
                    <div className="min-w-[640px]">
                        <div className="overflow-hidden rounded-[12px] border border-[var(--table-border)] bg-[var(--table-bg)]">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-[var(--table-header)]">
                                        <TableHead>Nome</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Acoes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pokemons.map((pokemon) => (
                                        <TableRow key={pokemon.name}>
                                            <TableCell className="uppercase">{pokemon.name}</TableCell>
                                            <TableCell className="text-sm text-[var(--muted)]">{pokemon.url}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpen(pokemon.name)}
                                                    disabled={detailLoading}
                                                >
                                                    Detalhes
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!pokemons.length && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-[var(--muted)]">
                                                Nenhum Pokemon encontrado.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {loading && (
                    <p className="text-sm text-[var(--muted)]">
                        <Loader2 className="inline-block h-4 w-4 animate-spin" /> Carregando
                    </p>
                )}
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{detail ? detail.name : activeName ?? 'Detalhes do Pokémon'}</DialogTitle>
                        <DialogDescription>
                            {detail
                                ? 'Informações detalhadas do Pokémon selecionado.'
                                : 'Carregando informações...'}
                        </DialogDescription>
                    </DialogHeader>

                    {detailLoading && (
                        <div className="mt-4 flex justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-[var(--muted)]" />
                        </div>
                    )}

                    {detail && (
                        <div className="mt-6 space-y-4">
                            {detail.sprite ? (
                                <img
                                    src={detail.sprite}
                                    alt={detail.name}
                                    className="mx-auto h-32 w-32 object-contain"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded border border-[var(--border)] text-sm text-[var(--muted)]">
                                    Sem imagem
                                </div>
                            )}

                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Tipos</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {detail.types.map((type) => (
                                        <Badge key={type} variant="secondary">
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Status base</p>
                                <div className="mt-2 grid md:grid-cols-2 gap-2">
                                    {detail.stats.map((stat) => (
                                        <div
                                            key={stat.name}
                                            className="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2"
                                        >
                                            <span className="capitalize text-sm">{stat.name}</span>
                                            <span className="font-semibold">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {detailError && <p className="text-sm text-red-500">{detailError}</p>}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Fechar</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
