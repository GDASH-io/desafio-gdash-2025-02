import { generateInsightByHourly } from "@/handlers/insight";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const insights = await generateInsightByHourly()
  return NextResponse.json({resp: insights})
}