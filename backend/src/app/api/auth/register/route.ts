import { HandleSession } from "@/handlers/session"
import { tryLoginUser, tryRegisterUser } from "@/handlers/user"
import { NextRequest, NextResponse } from "next/server"

interface RegisterBody {
  name: string
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    let session = await HandleSession(request)
    if (!session) {
      return NextResponse.json({}, {status:401})
    }

    const body:RegisterBody = await request.json()
    const result = await tryRegisterUser(body.name, body.email, body.password, session)
    if (!result) {
      return NextResponse.json({}, {status:401})
    }

    return NextResponse.json({goToPage: "/"})
  }catch {
    return NextResponse.json({}, {status:500})
  }
}