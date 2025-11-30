import ComparativeChart from "./components/ComparativeChart";
import TemperatureChart from "./components/TemperatureChart";
import WindSpeedChart from "./components/WindSpeedChart";
import { useAnalyticsController } from "./useAnalyticsController";

function Analytics() {
  const {
    windData,
    temperatureData,
    comparativeData,
    setWindFilters,
    setTemperatureFilters,
    setComparativeFilters,
    windFilters,
    temperatureFilters,
    comparativeFilters,
  } = useAnalyticsController();

  return (
    <div className="min-h-screen bg-linear-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-full mx-auto mb-8">
          <div>
            <WindSpeedChart
              data={windData.data || []}
              viewMode={windFilters.type}
              setFilters={setWindFilters}
              isLoading={windData.isLoading}
            />
          </div>
          <div>
            <TemperatureChart
              viewMode={temperatureFilters.type}
              setFilters={setTemperatureFilters}
              isLoading={temperatureData.isLoading}
              data={temperatureData.data || []}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <ComparativeChart
            isLoading={comparativeData.isLoading}
            viewMode={comparativeFilters.type}
            setFilters={setComparativeFilters}
            data={comparativeData.data || []}
          />
        </div>
      </div>
    </div>
  );
}

export default Analytics;
