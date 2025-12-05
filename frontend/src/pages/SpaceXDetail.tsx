import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { getSpaceXLaunchById } from "@/lib/externalApi";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link, redirect, useNavigate } from "react-router-dom";

import type { Launch } from "@/lib/externalApi";

import { StatusBadge } from "@/components/LaunchStatusBadge";

export default function SpaceXDetail() {
  const { id } = useParams();
  const [launch, setLaunch] = useState<Launch | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSpaceXLaunchById(id!).then(setLaunch).catch(console.error);
  }, [id]);

  const handleBackButtonClick = () => {
    navigate('/launches');
  }

  if (!launch) return <p className="p-6">Carregando...</p>;

  return (
    <div className="p-6 space-y-4">
      <Button onClick={handleBackButtonClick} className="flex items-center gap-2">
        <ArrowLeft/> Voltar
      </Button>
      <Card className="flex flex-col gap-4 items-center max-w-5xl mx-auto p-5">
        <CardTitle className="flex flex-row gap-4 items-center font-bold text-xl">
          {launch.name}
          <StatusBadge {...launch} />
        </CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-8">
            <div className="flex flex-col items-center">
              {launch.links?.patch?.small && (
                <img
                  src={launch.links.patch.small}
                  alt={launch.name}
                  className="w-64 mt-4"
                />
              )}
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-slate-500 font-semibold">Data do Lançamento</p>
                <p className="text-slate-500 ml-2 text-sm">{new Date(launch.date_utc).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Detalhes</p>
                <p className="text-slate-500 ml-2 text-sm">{launch.details ?? "Sem descrição"}</p>
              </div>
              {launch.failures && launch.failures.length > 0 && (
                <div className="bg-red-100 text-red-800 hover:bg-red-100 p-4 rounded-lg">
                  <p className="font-semibold">Falhas</p>
                  <ul className="list-disc list-inside ml-2 text-sm">
                    {launch.failures.map((failure: any, index: number) => (
                      <li key={index}>{failure.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
