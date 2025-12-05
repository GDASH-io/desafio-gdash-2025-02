import { CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "../../ui/chart";
import { getAverageValue } from "@/utils/getAverageValue";
import { useLastWeekTemperatures } from "@/hooks/useLastWeekTemperatures";
import { CircleXIcon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AverageTemperature() {

  const { lastWeekTemperatures, isLoading, isError, refetch } = useLastWeekTemperatures();

  let averageTemp = undefined;

  if (lastWeekTemperatures) {
    averageTemp = lastWeekTemperatures.map((value: { date: string, temperatures: number[] }) => {
      let date = new Date(value.date)
      let dateFieldValue = date.toLocaleDateString()
        .slice(0, 5);

      if (date.getDate() === new Date().getDate()) dateFieldValue = "hoje"
      return {
        date: dateFieldValue,
        temperature: getAverageValue(value.temperatures)
      }
    }
    )
  }

  const chartConfig = {
    temperature: {
      label: "temperatura (ºC)",
      color: "var(--chart-3)"
    }
  } satisfies ChartConfig

  return (
    <section>
      <Card className="xl:min-h-full justify-evenly">
        <CardHeader>
          <CardTitle className="text-center">Temperatura durante a semana (média)</CardTitle>
        </CardHeader>
        <CardContent>
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
          {(!isLoading && !isError && !averageTemp) && (
            <div className="flex flex-col gap-2 items-center m-3 mb-6">
              <CircleXIcon size={20} />
              <CardTitle>Sem dados</CardTitle>
              <Button className="mt-2" onClick={() => refetch()} disabled={isLoading}>Tentar novamente</Button>
            </div>
          )}
          {(!isLoading && !isError && averageTemp) && (
            <ChartContainer config={chartConfig} className="w-full -translate-x-6">
              <AreaChart accessibilityLayer data={averageTemp} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={true}
                  tickMargin={20}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <YAxis
                  tickLine={true}
                  tickFormatter={value => value + "ºC"}
                />
                <Area
                  dataKey={"temperature"}
                  type="linear"
                  fill="var(--color-temperature)"
                  fillOpacity={0.4}
                  stroke="var(--color-temperature)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </section>
  )
}