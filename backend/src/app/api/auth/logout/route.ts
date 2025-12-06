import { HandleSession } from "@/handlers/session"
import { tryLogoutUser } from "@/handlers/user"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    let session = await HandleSession(request)
    if (!session) {
      return NextResponse.json({}, {status:401})
    }

    const result = await tryLogoutUser(session)
    if (!result) {
      return NextResponse.json({}, {status:401})
    }

    return NextResponse.json({goToPage: "/"})
  }catch {
    return NextResponse.json({}, {status:500})
  }
}