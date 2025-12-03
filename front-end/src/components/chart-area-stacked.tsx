import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import type { ChartConfig } from "./ui/chart";
import { TimerIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Axios } from "../lib/axios";

interface RawClimateItem {
  props: {
    timeStamp: string | number | Date;
    temperature: number;
    windSpeed: number;
  };
}
interface DataCharts {
  hour: string;
  temperature: number;
  windSpeed: number;
}

const chartConfig = {
  temperature: {
    label: "Temperature (°C)",
    color: "var(--chart-1)",
  },
  windSpeed: {
    label: "Velocidade do Vento (km/h)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartDashboard() {
  const [data, SetData] = useState<DataCharts[]>([]);

  const page = 1;

  async function handleRequestDataCharts() {
    const token = Cookies.get("token");
    const response = await Axios.get(
      `/get/${page}/climate`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const { climate } = response.data;

    return climate;
  }

  useEffect(() => {
    async function handleDataCharts() {
      const rawData = await handleRequestDataCharts();
      const formatted: DataCharts[] = (rawData as RawClimateItem[]).map(
        (item: RawClimateItem) => ({
          hour: new Date(item.props.timeStamp)
            .toLocaleTimeString("pt-BR", {
              hour: "2-digit",
            })
            .concat("H"),
          temperature: item.props.temperature,
          windSpeed: item.props.windSpeed,
        })
      );
      SetData([...formatted].reverse());
    }
    handleDataCharts();
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature e Velocidade do Vento</CardTitle>
        <CardDescription>gráfico referente a cada hora</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="temperature"
              type="natural"
              fill="var(--chart-1)"
              fillOpacity={0.4}
              stroke="var(--chart-1)"
              stackId="a"
            />
            <Area
              dataKey="windSpeed"
              type="natural"
              fill="var(--chart-2)"
              fillOpacity={0.4}
              stroke="var(--chart-2)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              24 Horas <TimerIcon />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Relatório a cada hora do dia
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
