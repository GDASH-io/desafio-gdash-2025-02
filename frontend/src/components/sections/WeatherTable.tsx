import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Download, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { DataTable } from '../ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '../ui/pagination';

type WeatherRecord = {
    city: string;
    condition?: string;
    temperatureC: number;
    humidityPercent?: number;
    windSpeedKmh?: number;
    collectedAt: string;
};

type Pagination = {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
};

interface WeatherTableProps {
    logs: WeatherRecord[];
    filters?: ReactNode;
    pagination?: Pagination;
    onRefresh?: () => void;
    onExport?: (type: 'csv' | 'xlsx') => void;
    loading?: boolean;
}

export function WeatherTable({ logs, filters, pagination, onRefresh, onExport, loading }: WeatherTableProps) {
    const hasPagination = pagination && pagination.totalPages > 1;
    const [openExport, setOpenExport] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const formatDate = (value: string) => {
        const date = new Date(value);
        const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${day} - ${time}`;
    };

    useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                setOpenExport(false);
            }
        };
        document.addEventListener('mousedown', listener);
        return () => document.removeEventListener('mousedown', listener);
    }, []);

    const columns: ColumnDef<WeatherRecord>[] = [
        {
            accessorKey: 'city',
            header: 'Cidade',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-[var(--table-text)]">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--table-header)] text-[var(--table-muted)]">
                        <MapPin size={20} />
                    </span>
                    <span className="whitespace-nowrap text-[15px] font-semibold">{row.original.city}</span>
                </div>
            )
        },
        {
            accessorKey: 'collectedAt',
            header: 'Data',
            cell: ({ row }) => (
                <span className="whitespace-nowrap text-[var(--table-text)]">
                    {formatDate(row.original.collectedAt)}
                </span>
            )
        },
        {
            accessorKey: 'temperatureC',
            header: 'Temperatura',
            cell: ({ row }) => (
                <span className="whitespace-nowrap text-[var(--table-text)]">
                    {`${row.original.temperatureC.toFixed(1)} C°`}
                </span>
            )
        },
        {
            accessorKey: 'humidityPercent',
            header: 'Umidade',
            cell: ({ row }) => (
                <span className="whitespace-nowrap text-[var(--table-text)]">
                    {row.original.humidityPercent !== undefined ? `${row.original.humidityPercent}%` : '--'}
                </span>
            )
        },
        {
            accessorKey: 'condition',
            header: 'Condição',
            cell: ({ row }) => (
                <span className="whitespace-nowrap text-[var(--table-text)] capitalize">
                    {row.original.condition ?? '--'}
                </span>
            )
        }
    ];

    return (
        <Card>
            <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-[var(--table-text)]">Registros recentes</p>
                        {filters}
                    </div>
                    <div className="flex items-center gap-2" ref={exportRef}>
                        {onExport && (
                            <div className="relative">
                                <Button variant="secondary" size="sm" onClick={() => setOpenExport((prev) => !prev)}>
                                    <Download className="h-4 w-4" />
                                    Exportar
                                </Button>
                                {openExport && (
                                    <div className="absolute right-0 top-11 w-36 rounded-[8px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
                                        <button
                                            className="w-full px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--table-row-hover)]"
                                            onClick={() => {
                                                onExport('csv');
                                                setOpenExport(false);
                                            }}
                                        >
                                            Baixar CSV
                                        </button>
                                        <button
                                            className="w-full px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--table-row-hover)]"
                                            onClick={() => {
                                                onExport('xlsx');
                                                setOpenExport(false);
                                            }}
                                        >
                                            Baixar XLSX
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {onRefresh && (
                            <Button onClick={onRefresh} size="sm" disabled={loading}>
                                {loading ? 'Atualizando...' : 'Atualizar dados'}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[640px]">
                        <DataTable columns={columns} data={logs} />
                    </div>
                </div>

                {hasPagination && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        pagination?.onPrev();
                                    }}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive>
                                    {pagination!.page} / {pagination!.totalPages}
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        pagination?.onNext();
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </section>
        </Card>
    );
}