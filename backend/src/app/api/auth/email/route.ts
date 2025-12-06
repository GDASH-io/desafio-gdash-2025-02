import { findtUserByEmail } from "@/db/models/user";
import { NextRequest, NextResponse } from "next/server";

interface EmailBody {
  email: string
} 

export async function POST(request: NextRequest) {
  try {
    const body:EmailBody = await request.json()

    const user = await findtUserByEmail(body.email) 

    if (user && user._id) {
      return NextResponse.json({goToStep: "login"})
    }

    return NextResponse.json({goToStep: "register"})
  } catch {
    return NextResponse.json({}, {status: 401})
  }
}