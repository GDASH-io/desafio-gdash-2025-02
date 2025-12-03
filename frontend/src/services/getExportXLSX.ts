import { httpClient } from "./httpClient";

export const getExportXLSX = async () => {
  const response = await httpClient.get("/weather/export/xlsx", {
    responseType: "blob",
  });
  return response.data;
};
