import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useToast } from '../ui/toast';
import { Trash } from 'lucide-react';

type Location = {
    _id?: string;
    name: string;
    latitude: number;
    longitude: number;
    active: boolean;
};

type Suggestion = {
    id: string | number;
    name: string;
    latitude: number;
    longitude: number;
    country_code: string;
};

interface LocationManagerProps {
    locations: Location[];
    onAdd: (payload: { name: string; latitude: number; longitude: number }) => Promise<void>;
    onDelete: (id?: string) => Promise<void>;
    pagination: {
        page: number;
        totalPages: number;
        onPrev: () => void;
        onNext: () => void;
    };
}

export function LocationManager({ locations, onAdd, onDelete, pagination }: LocationManagerProps) {
    const { notify } = useToast();
    const [citySearch, setCitySearch] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    const searchCity = async (term: string) => {
        setCitySearch(term);
        if (term.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=5&language=pt&format=json`
            );
            const data = await response.json();
            setSuggestions(data.results ?? []);
        } catch {
            setSuggestions([]);
        }
    };

    const handleSelect = (item: Suggestion) => {
        setCitySearch(item.name);
        setSuggestions([]);
        onAdd({ name: item.name, latitude: item.latitude, longitude: item.longitude });
        notify('Cidade adicionada à coleta', 'success', 'map');
    };

    return (
        <Card>
            <p className="mb-3 text-lg font-semibold theme-text">Locais monitorados</p>
            <div className="space-y-3">
                <div className="relative">
                    <Input
                        placeholder="Digite a cidade e selecione"
                        value={citySearch}
                        onChange={(e) => searchCity(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-12 z-50 space-y-1 rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-2 text-sm text-[var(--text)] shadow-[var(--shadow-soft)]">
                            {suggestions.map((item) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    className="flex w-full justify-between rounded-lg px-3 py-2 text-left hover:bg-[var(--table-row-hover)]"
                                    onClick={() => handleSelect(item)}
                                >
                                    <span>{item.name}</span>
                                    <span className="text-xs text-[var(--muted)]">{item.country_code}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 space-y-4">
                {locations.length === 0 && <p className="text-sm text-gray-500">Nenhuma cidade adicionada ainda.</p>}
                {locations.length > 0 && (
                    <>
                        <div className="overflow-x-auto">
                            <div className="min-w-[520px]">
                                <div className="overflow-hidden rounded-[12px] border border-[var(--table-border)] bg-[var(--table-bg)] shadow-[var(--shadow-soft)]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-[var(--table-header)]">
                                                <TableHead>Cidade</TableHead>
                                                <TableHead>Coordenadas</TableHead>
                                                <TableHead>Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {locations.map((location) => (
                                                <TableRow key={location._id ?? location.name}>
                                                    <TableCell>{location.name}</TableCell>
                                                    <TableCell>{`${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onDelete(location._id)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                            Remover
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[var(--table-muted)]">
                            <p>
                                Página {pagination.page} de {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={pagination.onPrev} disabled={pagination.page <= 1}>
                                    Anterior
                                </Button>
                                <Button variant="ghost" size="sm" onClick={pagination.onNext} disabled={pagination.page >= pagination.totalPages}>
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}
