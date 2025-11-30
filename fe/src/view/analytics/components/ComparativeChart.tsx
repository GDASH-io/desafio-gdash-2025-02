import { DatePicker } from "@/components/datePicker";
import DoubleLineChartComponent from "@/components/DoubleLineChart";
import { SelectOptions } from "@/components/SelectOptions";
import { ChartSkeleton } from "@/components/skeletons/ChartSkeleton";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";

interface ComparativeData {
  hour: string;
  temperature: number;
  windSpeed: number;
}

interface ComparativeChartProps {
  data: ComparativeData[];
  viewMode?: "hour" | "day";
  date?: Date;
  setFilters: (filters: { type: "hour" | "day"; date?: Date; limit?: number }) => void;
  isLoading: boolean;
}

const dayOptions = [
  { label: "5 dias", value: "5" },
  { label: "10 dias", value: "10" },
  { label: "15 dias", value: "15" },
  { label: "30 dias", value: "30" },
  { label: "Tudo", value: "0" },
];

const ComparativeChart = ({
  data,
  viewMode = "hour",
  date,
  setFilters,
  isLoading
}: ComparativeChartProps) => {
  const hasData = data && data.length > 0;

  const handleDate = (selectedDate: Date) => {
    setFilters({ type: viewMode, date: selectedDate });
  }

  const handleDaysOptions = (days: string) => {
    setFilters({ type: viewMode, limit: Number(days) });
  }

  const handleViewMode = (mode: "hour" | "day") => {
    setFilters({ type: mode });
  }

  return (
    <Card className="p-6 bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-primary/20 to-accent/20">
            <TrendingUp className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-card-foreground">
              Comparativo Temperatura × Vento
            </h2>
            <p className="text-xs text-muted-foreground">
              Evolução das duas métricas ao longo do tempo
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {viewMode === "hour" && <DatePicker date={date || new Date()} setDate={handleDate} />}
          {viewMode === "day" && <SelectOptions options={dayOptions} setOptions={handleDaysOptions} />}

          {hasData && (
            <Tabs
              value={viewMode}
              onValueChange={(v) => handleViewMode(v as "hour" | "day")}
            >
              <TabsList>
                <TabsTrigger value="hour" asChild>
                  <div role="button" className="cursor-pointer">
                    Por Hora
                  </div>
                </TabsTrigger>
                <TabsTrigger value="day" asChild>
                  <div role="button" className="cursor-pointer">
                    Por Dia
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>
      {isLoading && <ChartSkeleton />}
      {!isLoading && <DoubleLineChartComponent 
        data={data}
        xAxisKey={viewMode === "hour" ? "hour" : "date"}
        leftDataKey="temperature"
        rightDataKey="windSpeed"
        leftYAxisLabel="Temperatura (°C)"
        rightYAxisLabel="Vento (km/h)"
        leftTooltipUnit="°C"
        rightTooltipUnit=" km/h"
        leftLegendLabel="Temperatura (°C)"
        rightLegendLabel="Velocidade do Vento (km/h)"
      />}
    </Card>
  );
};

export default ComparativeChart;
