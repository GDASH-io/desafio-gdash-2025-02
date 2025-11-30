import { Rocket } from "lucide-react"

export function ExplorerHeader() {
  return (
    <div className="text-center mb-12 pt-8 border-b-2 border-yellow-400 pb-8 relative">
      <h1 className="text-5xl font-bold text-yellow-400 uppercase tracking-[3px] mb-2 drop-shadow-[0_0_10px_rgba(255,232,31,0.5)] flex justify-center items-center gap-4">
        <Rocket className="h-10 w-10" /> Star Wars Dashboard
      </h1>
      <p className="text-xl text-slate-300 opacity-80">
        Explore o universo de Star Wars através da SWAPI
      </p>
    </div>
  )
}