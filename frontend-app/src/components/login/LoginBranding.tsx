import { CloudSun } from "lucide-react"

export function LoginBranding() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 border-r border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600/5 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="flex items-center gap-2 z-10 font-medium text-xl">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <CloudSun className="text-white h-5 w-5" />
        </div>
        GDASH 2025
      </div>

      <div className="z-10 max-w-md">
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">
          O futuro da energia renovável começa aqui.
        </h2>
        <p className="text-slate-400 text-lg">
          Monitoramento em tempo real, insights baseados em IA e gestão eficiente para usinas fotovoltaicas.
        </p>
      </div>

      <div className="z-10 text-sm text-slate-500">
        &copy; 2025 GDASH Energy Solutions.
      </div>
    </div>
  )
}
