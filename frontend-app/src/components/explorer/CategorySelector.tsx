import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { User, Globe, Film, Ghost, Rocket, Plane } from "lucide-react"

export const CATEGORIES = [
  { id: 'people', label: 'Personagens', icon: User, color: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400' },
  { id: 'planets', label: 'Planetas', icon: Globe, color: 'bg-green-500', border: 'border-green-500', text: 'text-green-400' },
  { id: 'films', label: 'Filmes', icon: Film, color: 'bg-red-500', border: 'border-red-500', text: 'text-red-400' },
  { id: 'species', label: 'Espécies', icon: Ghost, color: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400' },
  { id: 'starships', label: 'Naves', icon: Rocket, color: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400' },
  { id: 'vehicles', label: 'Veículos', icon: Plane, color: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-400' },
] as const;

interface CategorySelectorProps {
  current: string;
  onChange: (id: string) => void;
}

export function CategorySelector({ current, onChange }: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = current === cat.id;
        
        return (
          <Button
            key={cat.id}
            variant="outline"
            onClick={() => onChange(cat.id)}
            className={cn(
              "rounded-full border transition-all duration-300 flex items-center gap-2 px-6 py-6",
              isActive 
                ? `${cat.color} text-white border-transparent shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:${cat.color} hover:text-white` 
                : `bg-slate-900 border-slate-700 text-slate-300 hover:border-${cat.color.split('-')[1]}-500 hover:text-white`
            )}
          >
            <Icon className={cn("h-5 w-5", !isActive && cat.text)} />
            <span className="font-semibold text-lg">{cat.label}</span>
          </Button>
        )
      })}
    </div>
  )
}