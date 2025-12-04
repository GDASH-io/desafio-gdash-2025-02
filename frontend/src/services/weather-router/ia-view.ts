import api from "../../lib/axios.ts";

export async function getWeatherInsight(current: any, forecast: any, question?: string) {
  const res = await api.post("/insights/generate", {
    current,
    forecast,
    question
  });
  console.log(res.data.body.body)

  return res.data.body.body;
}
