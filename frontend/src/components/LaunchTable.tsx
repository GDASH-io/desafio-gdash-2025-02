// src/components/LaunchTable.tsx
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { Launch } from "@/lib/externalApi";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "./LaunchStatusBadge";


export function LaunchTable({ launches }: { launches: Launch[] }) {
    const navigate = useNavigate();

    const handleDetailsClick = (id: string) => {
        navigate(`/launches/${id}`);
    }
  return (
    <div>
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[220px]">Data do Lançamento</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[220px] text-center">Voo #</TableHead>
                <TableHead className="w-[220px] text-center">Status</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {launches.length === 0 ? (
                <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-slate-500">Nenhum lançamento encontrado.</TableCell>
                </TableRow>
            ) : (
                launches.map((l) => (
                <TableRow key={l.id}>
                    <TableCell>{new Date(l.date_utc).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-center">{l.flight_number ?? "—"}</TableCell>
                    <TableCell className="text-center">
                    <StatusBadge {...l} />
                    </TableCell>
                    <TableCell className="text-center">
                        <Button size="sm" onClick={() => handleDetailsClick(l.id)}>
                            Details
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
            </TableBody>
        </Table>
    </div>
  );
}
