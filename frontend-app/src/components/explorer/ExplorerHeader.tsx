import { Rocket } from "lucide-react"

export function ExplorerHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="h-12 w-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/50">
        <Rocket className="h-6 w-6 text-yellow-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white">Explorador Galáctico</h1>
        <p className="text-slate-400">Integração SWAPI (Star Wars API) via NestJS</p>
      </div>
    </div>
  )
}
