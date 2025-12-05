import { verifyUv } from "@/utils/verifyUv";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { TypographyMuted } from "../ui/tipography";
import { useAtomValue } from "jotai";
import { weatherDataAtom } from "@/atom/store";

export function UvIndex() {

  const data = useAtomValue(weatherDataAtom);

  if(!data) return <p>Erro</p>

  return (
    <section className="min-w-1/2">
      <Card className="min-h-full relative overflow-hidden gap-2">
        <CardHeader>
          <CardDescription className="text-1xl">Índice UV</CardDescription>
          <CardAction className="text-purple-500 absolute -top-8 -right-6 rotate-25 opacity-20 ">
            <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-sunglasses">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M8 4h-2l-3 10" /><path d="M16 4h2l3 10" />
              <path d="M10 16h4" />
              <path d="M21 16.5a3.5 3.5 0 0 1 -7 0v-2.5h7v2.5" />
              <path d="M10 16.5a3.5 3.5 0 0 1 -7 0v-2.5h7v2.5" />
              <path d="M4 14l4.5 4.5" />
              <path d="M15 14l4.5 4.5" />
            </svg>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl">{Math.round(data.dailyInfo.uvIndex[0])}</CardTitle>
        </CardContent>
        <CardFooter>
          <TypographyMuted>{verifyUv(Math.round(data.dailyInfo.uvIndex[1]))}</TypographyMuted>
        </CardFooter>
      </Card>
    </section>
  )
}