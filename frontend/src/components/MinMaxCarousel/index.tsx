import Autoplay from "embla-carousel-autoplay"
import React from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel"
import { useAtomValue } from "jotai"
import { weatherDataAtom } from "@/atom/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useWindowWidth } from "@/hooks/useWindowWidth"

export function MinMaxCarousel() {

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  )
  const windowWidth = useWindowWidth()

  const data = useAtomValue(weatherDataAtom)

  if (!data) return <p>Erro</p>

  return (
    <section className="min-w-full lg:col-span-2">
      <Carousel
        opts={{
          loop: true,
          watchDrag: windowWidth < 1536
        }}
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        {(windowWidth < 1536) && <CarouselPrevious className="z-1 left-0" />}
        <CarouselContent className="z-0 -ml-[0.8rem]">
          {data.dailyInfo.days.map((day: string, i: number) => (
            <CarouselItem className="basis-1/2 sm:basis-1/3 md:basis-1/4 xl:basis-1/5 2xl:basis-1/7 pl-[0.8rem]" key={day}>
              <div
                className={`
                    ${new Date(day).toLocaleDateString("pt-br") === new Date().toLocaleDateString("pt-br") &&
                  `border-transparent 
                    p-px 
                    rounded-xl 
                    bg-linear-to-br 
                    from-blue-200 
                    via-blue-400 
                    to-blue-700
                  `}`}>
                <Card className="h-full md:border">
                  <CardHeader>
                    <CardDescription className="flex justify-between">
                      <span>
                        {
                          new Date(day).toLocaleDateString("pt-br") === new Date().toLocaleDateString("pt-br") ?
                            "hoje" : new Date(day).toLocaleString("pt-br", { weekday: "short" }).slice(0, 3)
                        }
                      </span>
                      <span>{new Date(day).toLocaleDateString("pt-br").slice(0, 5)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full">
                      <tbody className="flex flex-col gap-3">
                        <tr className="flex justify-between">
                          <td><CardTitle>Min.</CardTitle></td>
                          <td className="text-end"><CardTitle>{Math.round(data.dailyInfo.tempMin[i])}ºC</CardTitle></td>
                        </tr>
                        <tr className="flex justify-between">
                          <td><CardTitle>Max.</CardTitle></td>
                          <td className="text-end"><CardTitle>{Math.round(data.dailyInfo.tempMax[i])}ºC</CardTitle></td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {(windowWidth < 1536) && <CarouselNext className="z-1 right-0" />}
      </Carousel>
    </section>
  )
}