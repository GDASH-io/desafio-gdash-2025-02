import api from "../../lib/axios.ts";

export async function downloadWeatherCsv(id?: string) {
  const url = id ? `/weather/export/csv/${id}` : `/weather/export/csv`;
  const res = await api.get(url, { responseType: "blob" });
  const blob = new Blob([res.data], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute(
    "download",
    id ? `weather_${id}.csv` : "weather_logs.csv"
  );
  link.click();
}