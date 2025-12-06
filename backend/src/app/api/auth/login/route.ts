import { HandleSession } from "@/handlers/session"
import { tryLoginUser } from "@/handlers/user"
import { NextRequest, NextResponse } from "next/server"

interface LoginBody {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    let session = await HandleSession(request)
    if (!session) {
      return NextResponse.json({}, {status:401})
    }

    const body:LoginBody = await request.json()
    const result = await tryLoginUser(body.email, body.password, session)
    if (!result) {
      return NextResponse.json({}, {status:401})
    }

    return NextResponse.json({goToPage: "/"})
  }catch {
    return NextResponse.json({}, {status:500})
  }
}