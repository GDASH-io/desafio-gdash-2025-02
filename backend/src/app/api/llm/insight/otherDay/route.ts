import { generateInsightByHourly, generateInsightsByDay } from "@/handlers/insight";
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  day: number,
  month: number,
}

export async function POST(request: NextRequest) {
  try {
    const body:RequestBody = await request.json()

    const date = new Date()
    date.setMonth(body.month - 1)
    date.setDate(body.day)

    const insights = await generateInsightsByDay(date)
    return NextResponse.json({resp: insights})
  }catch {
    return NextResponse.json({message: "erro interno"}, {status: 500})
  }
}