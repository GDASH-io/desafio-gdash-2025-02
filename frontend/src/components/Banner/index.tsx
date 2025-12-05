import { TrendingUpIcon } from "lucide-react";
import { RouterLink } from "../RouterLink";
import { Card, CardContent } from "../ui/card";
import { useWindowWidth } from "@/hooks/useWindowWidth";

export function Banner() {
  const windowWidth = useWindowWidth();
  const hightResolution = windowWidth > 1536
  return (
    <section className="lg:col-span-2">
      <Card className="overflow-hidden 2xl:h-30">
        <RouterLink url="/dashboard/graphics" className="relative">
          <TrendingUpIcon
            size={hightResolution ? 300 : 200}
            className={`
              z-0 
              absolute 
              right-0 
              -rotate-5 
              opacity-20 
              ${hightResolution ? "-top-25" : "-top-18"}`}
          />
          <CardContent className="z-1">
            <h3 className="font-sans font-semibold">Clique aqui para gráficos detalhados!</h3>
          </CardContent>
        </RouterLink>
      </Card>
    </section>
  )
}