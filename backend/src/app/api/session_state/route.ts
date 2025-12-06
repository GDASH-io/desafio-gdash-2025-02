import { HandleSession } from "@/handlers/session";
import { NextRequest, NextResponse } from "next/server";

interface User {
  display_name: string
}

interface Session {
  token: string
  user?: User
}

export async function GET(request: NextRequest) {
  const session = await HandleSession(request)
  if (!session) {
    return NextResponse.json({}, {status: 500})
  }

  let user: User|undefined
  if (session.user) {
    user = {display_name: session.user.name}
  }

  return NextResponse.json({token: session.token, user: user})
}