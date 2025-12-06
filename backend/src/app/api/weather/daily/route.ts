import { NextRequest, NextResponse } from "next/server";
import { 
  upsertDailyWeather, 
  IDailyWeather 
} from "@/db/models/dailyWeather";
import { generateInsightsByDay } from "@/handlers/insight";
import { addDays } from "date-fns";

let MASTER_TOKEN = process.env.MASTER_TOKEN

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]
    if (!token && token != MASTER_TOKEN) {
      console.warn(token)
      return NextResponse.json({}, { status: 401 });
    }

    const body = await request.json();

    const dataToProcess: IDailyWeather[] = Array.isArray(body) ? body : [body];

    if (dataToProcess.length === 0) {
      return NextResponse.json({ message: "Nenhum dado fornecido." }, { status: 400 });
    }

    const promises = dataToProcess.map((item) => upsertDailyWeather(item));
    await Promise.all(promises);

    const isTodayOrUp = (date: Date) => {
      const nextDay = addDays(Date.now(), 1)
      const limitDate = new Date(nextDay);
      limitDate.setDate(nextDay.getDate() + 2);
      limitDate.setHours(23, 59, 59, 999);
      return date > nextDay && date <= limitDate;
    };
    dataToProcess.map((data) => {
      const d = new Date(data.time)
      if (isTodayOrUp(d)) {
       generateInsightsByDay(d)
      }
    })

    return NextResponse.json(
      { message: `${dataToProcess.length} registro(s) diário(s) processado(s) com sucesso.` }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Erro no POST weather/daily:", error);
    return NextResponse.json(
      { error: "Erro ao processar dados diários." }, 
      { status: 500 }
    );
  }
}