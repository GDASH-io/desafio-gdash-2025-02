import { Bot, CircleXIcon, LoaderCircleIcon, RotateCcwIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { IaMessage } from "../IaMessage";
import { useIaData } from "@/hooks/useIaData";
import { Activity, useState } from "react";

export function IaInsights() {

  const { iaData, askForIaAnalysis, isLoading } = useIaData();
  const [message, setMessage] = useState("");

  const handleAskAnalysis = async () => {
    setMessage("");
    const success = await askForIaAnalysis();
    if (!success) {
      setMessage("Erro ao pedir por análise")
    }
  }

  return (
    <section>
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardAction>
            <Bot size={140} className="absolute -top-14 -right-8 rotate-25 opacity-20" color="#c94242" />
          </CardAction>
          <CardTitle>Meteorologista </CardTitle>
          {iaData && <CardDescription>Nível de preocupação: {iaData.concerningLevel * 100}%</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pl-10 pr-10">
          {isLoading &&
            (<div className="flex gap-2 justify-center m-3">
              <CardTitle>Carregando</CardTitle>
              <LoaderCircleIcon size={20} className="animate-spin" />
            </div>)
          }
          {
            (!isLoading && message) && (
              <div className="flex flex-col gap-2 items-center m-3 mb-6">
                <CircleXIcon size={20} />
                <CardTitle>Falha na solicitação</CardTitle>
              </div>
            )
          }
          <Activity mode={(!isLoading && iaData) ? "visible" : "hidden"}>
            {iaData?.weatherAnalysis && <IaMessage message={iaData.weatherAnalysis} />}
            {iaData?.suggestedAction && <IaMessage message={iaData.suggestedAction} />}
          </Activity>

          {(!isLoading && !iaData && !message) &&
            (<div className="flex flex-col gap-2 items-center m-3 mb-6">
              <CardTitle>Solicite uma análise!</CardTitle>
            </div>)}
          <Button
            className="flex flex-row ml-auto items-center border px-2 py-1 rounded-lg gap-2 -top-3 right-4 text-sm bg-white/10 text-white cursor-pointer hover:opacity-80 transition-opacity duration-300"
            onClick={handleAskAnalysis}
            disabled={isLoading}
          >
            <RotateCcwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Analisando..." : "Gerar Analise"}
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}