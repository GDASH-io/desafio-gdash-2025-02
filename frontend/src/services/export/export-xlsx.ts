import api from "../../lib/axios.ts";

export async function downloadWeatherXlsx(id?: string) {
  const url = id ? `/weather/export/xlsx/${id}` : `/weather/export/xlsx`;
  const res = await api.get(url, { responseType: "blob" });
  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute(
    "download",
    id ? `weather_${id}.xlsx` : "weather_logs.xlsx"
  );
  link.click();
}
