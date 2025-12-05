import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CloudRainIcon, CloudyIcon, DropletsIcon, MoonIcon, SunIcon, ThermometerIcon } from "lucide-react";
import { useAtomValue } from "jotai";
import { weatherDataAtom } from "@/atom/store";

export function WeatherInfo() {

  const data = useAtomValue(weatherDataAtom);

  if (!data) return <p>Erro</p>

  return (
    <section className="lg:col-span-2">
      <Card className="min-w-1/2 relative overflow-hidden">
        <span className="absolute z-0 -top-15 -right-15 blur-lg">
          {
            data.isDay === 1 ?
              <SunIcon size={200} className="text-yellow-300 drop-shadow-current drop-shadow-[0_0_12px]" /> :
              <MoonIcon size={200} className="text-blue-800 drop-shadow-current drop-shadow-[0_0_12px]" />
          }
        </span>
        <CardHeader>
          <CardTitle className="text-3xl z-1">
            {data.cityName}
          </CardTitle>
          <CardDescription className="z-1">
            <span className="mr-3">{new Date(data.date).toLocaleDateString()}</span>
            <span>{data.time}</span>
          </CardDescription>
          <CardTitle>Sensação térmica: {Math.round(data.apparentTemperature)}ºC</CardTitle>
        </CardHeader>
        <CardContent
          className="grid grid-cols-2 xl:grid-cols-4 grid-rows-[auto auto] gap-2 sm:justify-items-center"
        >
          <Card className="bg-accent min-w-1/2 sm:min-w-full max-w-60 relative overflow-hidden">
            <CardHeader>
              <CardDescription>Temperatura</CardDescription>
              <CardTitle>{Math.round(data.temperature)}ºC</CardTitle>
              <CardAction>
                <ThermometerIcon size={100} className="absolute -top-8 -right-5 rotate-25 opacity-20" color="#af943a" />
              </CardAction>
            </CardHeader>
          </Card>
          <Card className="bg-accent min-w-1/2 sm:min-w-full max-w-60 relative overflow-hidden">
            <CardHeader>
              <CardDescription>Chuva</CardDescription>
              <CardTitle>{Math.round(data.rain)}mm</CardTitle>
              <CardAction>
                <CloudRainIcon size={100} className="absolute -top-8 -right-5 rotate-25 opacity-20" color="#2b6fee" />
              </CardAction>
            </CardHeader>
          </Card>
          <Card className="bg-accent min-w-1/2 sm:min-w-full max-w-60 h-23 relative overflow-hidden">
            <CardHeader>
              <CardDescription>Umidade</CardDescription>
              <CardTitle>{Math.round(data.humidity)}%</CardTitle>
              <CardAction>
                <DropletsIcon size={100} className="absolute -top-6 -right-4 rotate-25 opacity-20" color="#3a4baf" />
              </CardAction>
            </CardHeader>
          </Card>
          <Card className="bg-accent min-w-1/2 sm:min-w-full max-w-60 h-23 relative overflow-hidden">
            <CardHeader>
              <CardDescription>Nuvens</CardDescription>
              <CardTitle>{Math.round(data.cloudCover)}%</CardTitle>
              <CardAction>
                <CloudyIcon size={100} className="absolute -top-6 -right-4 rotate-25 opacity-20" color="#a7d4ff" />
              </CardAction>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>
    </section>
  )
}