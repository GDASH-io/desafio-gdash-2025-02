import { IaMessage } from "@/components/IaMessage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import { useIaData } from "@/hooks/useIaData"
import { useWeatherData } from "@/hooks/useWeatherData"
import { LoaderCircleIcon } from "lucide-react"
import { CartesianGrid, YAxis, XAxis, Bar, LabelList, BarChart } from "recharts"

export function SolarRadiation() {
  const {weatherData} = useWeatherData();

  const chartRadiationConfig = {
    radiation: {
      label: "Radiação (MJ/m²)",
      color: "var(--chart-4)"
    }
  } satisfies ChartConfig

  const solarRadiation = weatherData!.dailyInfo.days.map((day: string, i: number) => {
    let date = new Date(day)
    let dateFieldValue = date.toLocaleDateString()
      .slice(0, 5);

    if (date.getDate() === new Date().getDate()) dateFieldValue = "(hoje)"
    return {
      date: dateFieldValue,
      day: date.toLocaleString("pt-br", { weekday: "short" }),
      radiation: weatherData!.dailyInfo.solarRadiation[i]
    }
  })

  const { iaData, askForIaAnalysis, isLoading } = useIaData();

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Radiação solar (total diária)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartRadiationConfig}>
            <BarChart
              accessibilityLayer
              data={solarRadiation}
              layout="vertical"
              margin={{
                right: 16,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="day"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => {
                  return value.slice(0, 3)
                }}
                hide
              />
              <XAxis dataKey={"radiation"} type="number" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Bar
                dataKey={"radiation"}
                layout="vertical"
                fill="var(--color-radiation)"
                radius={4}
              >
                <LabelList
                  dataKey={"date"}
                  position={"insideLeft"}
                  offset={8}
                  className="fill-purple-200"
                  fontSize={12}
                />
                <LabelList
                  dataKey="radiation"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                  format={"a"}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <Separator />
        {iaData && (
          <CardFooter className="flex flex-col gap-3 pl-10 pr-10">
            <IaMessage message={iaData.radiationAnalysis} />
          </CardFooter>
        )}
        {!iaData && (
          <CardFooter className="flex flex-col gap-3 pl-10 pr-10">
            <Button onClick={askForIaAnalysis}>
              Solicitar análise
            </Button>
          </CardFooter>
        )}
        {isLoading && (
          <div className="flex gap-2 justify-center m-3">
            <CardTitle>Analisando...</CardTitle>
            <LoaderCircleIcon size={20} className="animate-spin" />
          </div>
        )}
      </Card>
    </section>
  )
}