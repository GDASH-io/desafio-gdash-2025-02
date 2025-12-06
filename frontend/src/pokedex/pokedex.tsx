import { useEffect, useState, type ChangeEvent } from "react";
import { Card, CardContent, CardTitle } from "../components/ui/card";
import { RequestListPokemons, type PokemonResponse } from "../lib/pokedex";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { useNavigate } from "react-router";
import { useTheme } from "@/lib/theme";
import ToogleThemeButton from "@/ThemeButton";
import { FormatPokemonName } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Pokedex() {
  const { theme } = useTheme();
  const navigate = useNavigate()

  const [pokemons, setPokemons] = useState<(PokemonResponse|null)[]>([])
  const [page, setPage] = useState<number|null>(null)
  const [search, setSearch] = useState<string | null>(null)

  const saveState = () => {
    if(page) {
      localStorage.setItem("_pokedex_page", String(page))
    }
    if(search != null) {
      localStorage.setItem("_pokedex_search", search)
    }
  }

  const loadState = () => {
    const pageStorage = localStorage.getItem("_pokedex_page")
    const searchStorage = localStorage.getItem("_pokedex_search")

    if(searchStorage) {
      setSearch(searchStorage)
    }

    if(pageStorage) {
      setPage(Number(pageStorage))
    }
  }

  useEffect(() => {
    const newPokes = pokemons.map(() => {return null})
    setPokemons(newPokes)

    RequestListPokemons(page || 1, search || "").then(data => {
      setPokemons(data)
    })

    saveState()
  }, [page, search])

  useEffect(() => {
    loadState()
  }, [])

  const searchInput = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    setPage(1)
  }

  return (
    <div className={`w-screen h-screen flex items-center justify-center bg-linear-to-br ${theme === 'dark'
          ? 'bg-linear-to-br from-slate-950 via-zinc-950 to-slate-900'
          : 'bg-linear-to-br from-slate-50 via-zinc-50 to-slate-100'} `}>
      <ToogleThemeButton/>
      <Card className={`bg-linear-to-br w-180 h-160 pl-4 ${theme === 'dark'
          ? 'bg-linear-to-br from-blue-950/30 via-slate-900/50 to-zinc-900/80 border-zinc-800/50'
          : 'bg-linear-to-br from-blue-50 via-white to-slate-50 border-slate-200'}`}>
        <CardTitle>Pokedex</CardTitle>
        <CardContent className="w-full h-full flex  flex-wrap items-center justify-center">
          <div className="w-2/3 flex items-center space-x-2">
            <Search></Search>
            <Input placeholder="Pokemon" value={search ? search : ""} onChange={(e) => {searchInput(e)}}></Input>
          </div>
          <div className="w-130 h-100 flex flex-wrap items-center justify-center space-x-2 space-y-2">
            {pokemons.map(p => {
              return ( p ?
              <div className="flex flex-col items-center justify-center cursor-pointer w-30 h-30" onClick={() => {navigate(`/pokedex/${p.name}`)}}>
                <img src={p.spriteUrl || ""} className="w-26 h-26"></img>
                <span>{p && FormatPokemonName(p.name)}</span>
              </div>
              : <div className="flex flex-col items-center justify-center cursor-pointer w-30 h-30">  
                  <Skeleton className="w-26 h-26"></Skeleton>
                </div>  
              )
            })}
          </div>
          <div className="w-full flex items-center justify-center space-x-2">
            <Pagination>
              <PaginationContent>
                {page && page > 1 &&
                  <PaginationItem>
                    <PaginationPrevious className="cursor-pointer" onClick={() => {setPage(page-1)}}/ >
                  </PaginationItem>
                }
                {page && page > 1 && (
                  <PaginationItem>
                    <PaginationEllipsis/>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink>{page}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationEllipsis/>
                  </PaginationItem>
                <PaginationItem>
                  <PaginationNext className="cursor-pointer" onClick={() => {setPage((page || 1) + 1)}}/>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}