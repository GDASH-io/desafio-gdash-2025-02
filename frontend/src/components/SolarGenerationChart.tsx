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

import { CustomSolarGenerationChart } from "./CustomSolarGenerationChart"

interface SolarGenerationDay {
  date: string
  estimated_generation_kwh: number
}

interface SolarGenerationChartProps {
  data: SolarGenerationDay[]
}

export function SolarGenerationChart({ data }: SolarGenerationChartProps) {

  const chartConfig = {
    estimated_generation_kwh: {
      label: "Geração Estimada (kWh)",
      color: "var(--chart-2)",
    }
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ right: 20 }}
      >

        <CartesianGrid horizontal={false} strokeDasharray="3 3" />

        <YAxis
          dataKey="date"
          type="category"
          tick={{ fontSize: 12 }}
          width={70}
          tickFormatter={(d: string) =>
            new Date(d).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })
          }
        />

        <XAxis
          type="number"
          domain={[0, (max: number) => max * 1.1]}
        />

        <ChartTooltip
          cursor={{ fill: "rgba(0,0,0,0.05)" }}
          content={<CustomSolarGenerationChart />}
        />

        <Bar
          dataKey="estimated_generation_kwh"
          fill="var(--color-estimated_generation_kwh)"
          radius={[0, 6, 6, 0]}
        />

      </BarChart>
    </ChartContainer>
  )
}
