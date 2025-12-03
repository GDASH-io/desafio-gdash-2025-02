import axios from "axios";

export async function convertLatLonToCity(lat: number, lon: number) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;

  const { data } = await axios.get(url);
  return data.city || data.locality || "Cidade não encontrada";
}
