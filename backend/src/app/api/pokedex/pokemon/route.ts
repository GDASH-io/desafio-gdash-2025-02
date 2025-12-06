import { GetPokemon } from "@/handlers/pokedex";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const nameParam = request.nextUrl.searchParams.get("name")

    if (!nameParam) {
      return NextResponse.json({message: "parametro name ausente"}, {status: 400})
    }

    const pokemon = await GetPokemon(nameParam)

    if (!pokemon) {
      return NextResponse.json({message: "pokemon nao encontrado"}, {status: 400})
    }

    return NextResponse.json(pokemon)
  } catch {
    return NextResponse.json({message: "erro interno"}, {status: 500})
  }
}