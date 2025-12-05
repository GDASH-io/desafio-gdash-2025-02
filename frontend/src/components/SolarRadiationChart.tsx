'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig
} from "@/components/ui/chart"

import { CustomSolarRadiationTooltip } from "./CustomSolarRadiationTooltip"

interface SolarDayData {
  date: string
  solar_radiation: number // Wh/m²
}

interface SolarRadiationChartProps {
  data: SolarDayData[]
}

export function SolarRadiationChart({ data }: SolarRadiationChartProps) {

  const chartConfig = {
    solar_radiation: {
      label: "Radiação Solar (Wh/m²)",
      color: "var(--chart-4)",
    }
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} margin={{ top: 20 }}>

        <CartesianGrid vertical={false} strokeDasharray="3 3" />

        {/* Eixo X */}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(d: string) =>
            new Date(d).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })
          }
        />

        {/* Eixo Y */}
        <YAxis
          tick={{ fontSize: 12 }}
          unit=" Wh/m²"
          domain={[0, (max: number) => max * 1.1]}
        />

        {/* Tooltip com componente personalizado */}
        <ChartTooltip
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          content={<CustomSolarRadiationTooltip />}
        />

        {/* Barras */}
        <Bar
          dataKey="solar_radiation"
          fill="var(--color-solar_radiation)"
          radius={[6, 6, 0, 0]}
        />

      </BarChart>
    </ChartContainer>
  )
}
