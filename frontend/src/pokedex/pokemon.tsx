import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { RequestPokemon, type PokemonResponse } from "@/lib/pokedex"
import { useTheme } from "@/lib/theme"
import { FormatPokemonName } from "@/lib/utils"
import ToogleThemeButton from "@/ThemeButton"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

export default function Pokemon() {
  const { theme } = useTheme();
  const params = useParams()
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState<PokemonResponse | null>()

  useEffect(() => {
    if (params.pokemon) {
      RequestPokemon(params.pokemon).then((p) => {
        if (p) {
          setPokemon(p)
          const audio = new Audio(p.audioUrl)
          audio.play()
        }
      })
    }
    
  }, [])

  return (
    <div className={`w-screen h-screen flex items-center justify-center bg-linear-to-br ${theme === 'dark'
          ? 'bg-linear-to-br from-slate-950 via-zinc-950 to-slate-900'
          : 'bg-linear-to-br from-slate-50 via-zinc-50 to-slate-100'}`}>
      <ToogleThemeButton/>
      <Card className={`bg-linear-to-br w-160 h-140 pl-4 pr-4 ${theme === 'dark'
          ? 'bg-linear-to-br from-blue-950/30 via-slate-900/50 to-zinc-900/80 border-zinc-800/50'
          : 'bg-linear-to-br from-blue-50 via-white to-slate-50 border-slate-200'}`}>
        <CardHeader className="flex items-center">
          <a className="flex items-center cursor-pointer" onClick={() => {navigate(`/pokedex`)}}>
            <ArrowLeft></ArrowLeft>
            <CardTitle>{FormatPokemonName(pokemon?.name || "")}</CardTitle>
          </a>
        </CardHeader>
        <CardContent className="w-full h-full flex flex-col items-center justify-center">
          {pokemon ? 
            <img src={pokemon.spriteUrl || ""} alt=""  className="w-50 h-50"/> : 
            <Skeleton className="w-50 h-50"></Skeleton>
          }
          <div className="flex w-full">
            <div className="flex flex-col w-full h-full">
              <div className="flex w-full">
                {pokemon && 
                  <div className="w-full">
                    <div className="w-full flex justify-between items-center">
                      <span>Hp:</span>
                      <Progress className="w-2/3 bg-transparent" value={(100*pokemon.hp)/200}></Progress>
                    </div>
                    <div className="w-full flex justify-between items-center">
                      <span>Ataque:</span>
                      <Progress className="w-2/3 bg-transparent" value={(100*pokemon.attack)/200}></Progress>
                    </div>
                    <div className="w-full flex justify-between items-center">
                      <span>Defesa:</span>
                      <Progress className="w-2/3 bg-transparent" value={(100*pokemon.defense)/200}></Progress>
                    </div>
                    <div className="w-full flex justify-between items-center">
                      <span>Ataque Especial:</span>
                      <Progress className="w-2/3 bg-transparent" value={(100*pokemon.specialAttack)/200}></Progress>
                    </div>
                    <div className="w-full flex justify-between items-center">
                      <span>Defesa Especial:</span>
                      <Progress className="w-2/3 bg-transparent" value={(100*pokemon.specialDefense)/200}></Progress>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}