import { HandleSeachPokemons } from "@/handlers/pokedex/handlers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParam = request.nextUrl.searchParams.get("search")
    const pageParam = request.nextUrl.searchParams.get("page")

    const page = Number(pageParam) || 1
    if (page == 0) {
      return NextResponse.json({message: "page deve ser maior que 0"}, {status: 300})
    }
    const search = searchParam || ""

    const resp = await HandleSeachPokemons(search, page)
    return NextResponse.json(resp)
  } catch {
    return NextResponse.json({message: "erro interno"}, {status: 500})
  }
}