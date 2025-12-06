import { RequestMessageLLM } from "@/handlers/llm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({resp: await RequestMessageLLM(body.message, body.system, "")})
}