import { WindIcon } from "lucide-react";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAtomValue } from "jotai";
import { weatherDataAtom } from "@/atom/store";

export function WindSpeed() {

  const data = useAtomValue(weatherDataAtom);

  if(!data) return <p>Erro</p>

  return (
    <section className="min-w-1/2 min-h-full">
      <Card className="min-w-full min-h-full relative overflow-hidden">
        <CardHeader>
          <CardDescription className="text-1xl">Velocidade do vento</CardDescription>
          <CardTitle className="text-2xl">{(data.windSpeed.toLocaleString("pt-br"))}km/h</CardTitle>
          <CardAction>
            <WindIcon size={140} className="absolute -top-8 -right-4 rotate-25 opacity-20" color="#4ea74e" />
          </CardAction>
        </CardHeader>
      </Card>
    </section>
  )
}