import Cookies from "js-cookie";
import type { ClimateResponse, Climate } from "../components/table-dashboad";
import { Axios } from "./axios";

interface RawClimate {
  _id: { value: string };
  props: {
    timeStamp: string;
    temperature: number;
    windSpeed: number;
    windDirection: string;
    weatherCode: string;
  };
}

export async function handleDataTable(page: number): Promise<ClimateResponse> {
  const token = Cookies.get("token");

  const response = await Axios.get(
    `/get/${page}/climate`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const climates: Climate[] = (response.data.climate as RawClimate[]).map(
    (item) => ({
      id: item._id.value,
      timeStamp: item.props.timeStamp,
      temperature: item.props.temperature,
      windSpeed: item.props.windSpeed,
      windDirection: item.props.windDirection,
      weatherCode: item.props.weatherCode,
    })
  );

  return { climates };
}
export async function handleExportCSV(page: number) {
  
  const token = Cookies.get("token");

  const response = await Axios.get(
    `/get/${page}/climate/weather/export/csv`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );
  const blob = new Blob([response.data], { type: "text/csv" });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  // Nome do arquivo
  link.download = `climates-page-${page}.csv`;

  // dispara o "download"
  link.click();

  // limpa o link da memória
  window.URL.revokeObjectURL(url);
}

export async function handleExportXLSX(page: number) {
  const token = Cookies.get("token");

  const response = await Axios.get(
    `/get/${page}/climate/weather/export/xlsx`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "arraybuffer",
    }
  );


  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  // Nome do arquivo
  link.download = `climates-page-${page}.xlsx`;

  // dispara o "download"
  link.click();

  // limpa o link da memória
  window.URL.revokeObjectURL(url);
}
