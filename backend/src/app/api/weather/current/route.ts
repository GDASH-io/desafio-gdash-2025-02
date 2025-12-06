import { NextRequest, NextResponse } from "next/server";
import { 
  upsertCurrentWeather, 
  ICurrentWeather 
} from "@/db/models/currentWeatcher";

let MASTER_TOKEN = process.env.MASTER_TOKEN

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]
    if (!token && token != MASTER_TOKEN) {
      console.warn(token)
      return NextResponse.json({}, { status: 401 });
    }

    const data: ICurrentWeather = await request.json();

    const savedData = await upsertCurrentWeather(data);

    return NextResponse.json(savedData, { status: 201 });
  } catch (error: any) {
    console.error("Erro no POST weather/current:", error);
    return NextResponse.json(
      { error: "Dados inválidos ou erro no servidor." }, 
      { status: 500 }
    );
  }
}