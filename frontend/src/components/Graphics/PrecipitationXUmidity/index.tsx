import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { usePrecXHumidi } from "@/hooks/usePrecXHumidi";
import { getAverageValue } from "@/utils/getAverageValue";
import { CircleXIcon, LoaderCircleIcon } from "lucide-react";
import { CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts";

export function PrecipitationXUmidity() {

  const { precXHumidi, isLoading, isError, refetch } = usePrecXHumidi();

  const chartPrecHumiConfig = {
    precipitation: {
      label: "Precipitação (mm)",
      color: "var(--chart-1)"
    },
    humidity: {
      label: "Umidade (%)",
      color: "var(--chart-2)"
    }
  } satisfies ChartConfig

  let averagePrecHumi = undefined;

  if (precXHumidi) {
    averagePrecHumi = precXHumidi.map((value: { date: string, humidities: number[], precipitations: number[] }) => {
      let date = new Date(value.date)
      let dateFieldValue = date.toLocaleDateString()
        .slice(0, 5);

      if (date.getDate() === new Date().getDate()) dateFieldValue = "(hoje)"
      return {
        date: dateFieldValue,
        precipitation: value.precipitations.reduce((acc, val) => val + acc, 0),
        humidity: getAverageValue(value.humidities)
      }
    })
  }

  return (
    <section>
      <Card className="2xl:min-h-full justify-evenly">
        <CardHeader>
          <CardTitle className="text-center">Precipitação x Umidade (média)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex justify-cente 2xl:min-h-full">
          {isLoading && (
            <div className="flex gap-2 justify-center m-3">
              <CardTitle>Carregando</CardTitle>
              <LoaderCircleIcon size={20} className="animate-spin" />
            </div>
          )}
          {isError && (
            <div className="flex flex-col gap-2 items-center m-3 mb-6">
              <CircleXIcon size={20} />
              <CardTitle>Falha na solicitação</CardTitle>
              <Button className="mt-2" onClick={() => refetch()} disabled={isLoading}>Tentar novamente</Button>
            </div>
          )}
          {(!isLoading && !isError && !averagePrecHumi) && (
            <div className="flex flex-col gap-2 items-center m-3 mb-6">
              <CircleXIcon size={20} />
              <CardTitle>Sem dados</CardTitle>
              <Button className="mt-2" onClick={() => refetch()} disabled={isLoading}>Tentar novamente</Button>
            </div>
          )}
          {(!isLoading && !isError && averagePrecHumi) && (
            <ChartContainer config={chartPrecHumiConfig} className="h-40 md:h-80 w-full overflow-hidden">
              <AreaChart accessibilityLayer data={averagePrecHumi} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id="fillPrecipitation" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset={"5%"}
                      stopColor="var(--color-precipitation)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset={"95%"}
                      stopColor="var(--color-precipitation)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset={"5%"}
                      stopColor="var(--color-humidity)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset={"95%"}
                      stopColor="var(--color-humidity)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />}
                />
                <XAxis
                  dataKey={"date"}
                  tickLine={true}
                  tickMargin={20}
                  axisLine={false}
                />
                <YAxis
                  yAxisId={"left"}
                  orientation="left"
                  tickFormatter={(value) => `${value} mm`}
                />
                <YAxis
                  yAxisId={"right"}
                  orientation="right"
                  tickFormatter={(value) => `${value}%`}

                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  yAxisId={"left"}
                  dataKey={"precipitation"}
                  type={"monotone"}
                  fill="url(#fillPrecipitation)"
                  stroke="var(--color-precipitation)"
                  stackId={"a"}
                />
                <Area
                  yAxisId={"right"}
                  dataKey={"humidity"}
                  type={"monotone"}
                  fill="url(#fillHumidity)"
                  stroke="var(--color-humidity)"
                  stackId={"a"}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </section>
  )
}