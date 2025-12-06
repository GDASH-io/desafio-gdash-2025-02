import { NextRequest, NextResponse } from "next/server";
import { 
  upsertHourlyWeather, 
  IHourlyWeather 
} from "@/db/models/hourlyWeather";
import { generateInsightByHourly } from "@/handlers/insight";

let MASTER_TOKEN = process.env.MASTER_TOKEN

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]
    if (!token && token != MASTER_TOKEN) {
      console.warn(token)
      return NextResponse.json({}, { status: 401 });
    }


    const body = await request.json();

    const dataToProcess: IHourlyWeather[] = Array.isArray(body) ? body : [body];

    if (dataToProcess.length === 0) {
      return NextResponse.json({ message: "Nenhum dado fornecido." }, { status: 400 });
    }

    const promises = dataToProcess.map((item) => upsertHourlyWeather(item));
    await Promise.all(promises);

    generateInsightByHourly()

    return NextResponse.json(
      { message: `${dataToProcess.length} registro(s) processado(s) com sucesso.` }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Erro no POST weather/hourly:", error);
    return NextResponse.json(
      { error: "Erro ao processar dados horários." }, 
      { status: 500 }
    );
  }
}