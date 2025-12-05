'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart"
import { CustomTemperatureTooltip } from "./CustomTemperatureTooltip"

interface TempTrendPoint {
  date: string
  tmin: number
  tmax: number
}

interface TemperatureTrendChartProps {
  data: TempTrendPoint[]
}

export default function TemperatureTrendChart({ data }: TemperatureTrendChartProps) {
  const chartConfig = {
    tmax: {
      label: "Temp. Máxima",
      color: "var(--chart-4)",
    },
    tmin: {
      label: "Temp. Mínima",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  return (
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart data={data} margin={{ top: 20 }}>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            {/* Eixo X */}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(d: string) =>
                new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
              }
            />

            {/* Eixo Y */}
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, (max: number) => max * 1.1]}
              unit="°C"
            />

            {/* Tooltip do shadcn */}
            <ChartTooltip cursor={false} content={<CustomTemperatureTooltip />} />

            {/* Linha de Temperatura Mínima */}
            <Line
              dataKey="tmin"
              type="monotone"
              stroke="var(--color-tmin)"
              strokeWidth={2}
              dot={false}
            />

            {/* Linha de Temperatura Máxima */}
            <Line
              dataKey="tmax"
              type="monotone"
              stroke="var(--color-tmax)"
              strokeWidth={2}
              dot={false}
            />

          </LineChart>
        </ChartContainer>
  )
}
