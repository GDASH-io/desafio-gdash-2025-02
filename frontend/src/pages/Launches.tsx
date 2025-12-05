// src/pages/Launches.tsx
import React, { useEffect, useState } from "react";
import { getSpaceXLaunches } from "@/lib/externalApi";
import type { Launch } from "@/lib/externalApi";
import { LaunchTable } from "@/components/LaunchTable";
import { Pagination } from "@/components/Pagination";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner"; // se não tiver spinner, substitua por texto

import { toast } from 'sonner';

export default function LaunchesPage() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSpaceXLaunches(p, limit);
      setLaunches(res.docs || []);
      if (res.totalPages) setTotalPages(Number(res.totalPages));
      else if (res.total && res.limit) setTotalPages(Math.ceil(Number(res.total) / Number(res.limit)));
      else setTotalPages(undefined);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao buscar dados");
      setError(e?.message || "Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lançamentos SpaceX (via backend)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <span>Carregando lançamentos...</span>
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              <LaunchTable launches={launches} />
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
