import type React from "react";
import { useEffect, useState } from "react";
import { TypographyH1 } from "../ui/tipography";
import { CircleXIcon, LoaderCircleIcon } from "lucide-react";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Card, CardContent } from "../ui/card";

export function Loader({ children }: { children: React.ReactNode }) {

  const [isLoading, setIsLoading] = useState(true);
  const { fetchWeather } = useWeatherData();
  const [message, setMessage] = useState("Carregando dados do clima...")

  useEffect(() => {
    (async () => {
      if (fetchWeather !== null) {
        const success = await fetchWeather()
        if (success) {
          setIsLoading(false);
        } else {
          setMessage("Erro ao buscar pelos dados")
          setIsLoading(false);
        }
      }
    })()
  }, [])

  if (isLoading) {
    return (
      <section className="flex flex-col justify-center z-0 h-screen items-center bg-[#00000021]">
        <TypographyH1>{message}</TypographyH1>
        {isLoading && (
          <div className="flex items-center mt-5 gap-2">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight ">Aguarde</h3>
            <LoaderCircleIcon size={40} className="animate-spin" />
          </div>
        )}
      </section>
    )
  }

  if (isLoading === false && message.includes("Erro")) {
    return (
      <section className="flex flex-col justify-center z-0 h-screen items-center bg-[#00000021] p-3">
        <Card>
          <CardContent className="flex justify-center flex-col items-center">
            <CircleXIcon size={40} />
            <TypographyH1>{message}</TypographyH1>
          </CardContent>
        </Card>
      </section>
    )
  }

  return children
}