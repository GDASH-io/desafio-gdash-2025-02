import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORIES } from "./CategorySelector"
import { Ruler, Weight, Calendar, Activity, Zap, Users, HardDrive } from "lucide-react"

interface ResourceCardProps {
  item: any;
  category: string;
}

export function ResourceCard({ item, category }: ResourceCardProps) {
  const catConfig = CATEGORIES.find(c => c.id === category);
  const Icon = catConfig?.icon || Activity;
  const borderColor = catConfig?.border.replace('border-', 'border-') || 'border-slate-700';
  const iconColor = catConfig?.text || 'text-slate-400';
  //const hoverShadow = catConfig?.color.replace('bg-', 'shadow-') || 'shadow-slate-500'; 

  const InfoRow = ({ label, value, icon: RowIcon }: any) => (
    <div className="flex items-center gap-2 text-sm mb-2">
      <div className="w-6 flex justify-center text-slate-500"><RowIcon className="h-4 w-4" /></div>
      <span className="font-semibold text-slate-300 min-w-[100px]">{label}:</span>
      <span className="text-slate-100 capitalize truncate">{value}</span>
    </div>
  );

  const renderContent = () => {
    switch (category) {
      case 'people':
        return (
          <>
            <InfoRow label="Altura" value={`${item.height} cm`} icon={Ruler} />
            <InfoRow label="Peso" value={`${item.mass} kg`} icon={Weight} />
            <InfoRow label="Nasc." value={item.birth_year} icon={Calendar} />
            <InfoRow label="Gênero" value={item.gender} icon={Users} />
          </>
        );
      case 'planets':
        return (
          <>
            <InfoRow label="Clima" value={item.climate} icon={Zap} />
            <InfoRow label="Terreno" value={item.terrain} icon={HardDrive} />
            <InfoRow label="População" value={item.population} icon={Users} />
          </>
        );
      case 'starships':
      case 'vehicles':
        return (
          <>
            <InfoRow label="Modelo" value={item.model} icon={HardDrive} />
            <InfoRow label="Custo" value={`${item.cost_in_credits} cr`} icon={Zap} />
            <InfoRow label="Tripulação" value={item.crew} icon={Users} />
          </>
        );
      case 'films':
        return (
          <>
            <InfoRow label="Diretor" value={item.director} icon={Users} />
            <InfoRow label="Lançamento" value={item.release_date} icon={Calendar} />
            <p className="text-xs text-slate-400 mt-3 line-clamp-3 italic">
              "{item.opening_crawl}"
            </p>
          </>
        );
      default:
        return <div className="text-slate-500">Dados brutos disponíveis...</div>;
    }
  };

  return (
    <Card className={`bg-slate-900/80 backdrop-blur-sm border-t-4 ${borderColor} border-x-slate-800 border-b-slate-800 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group`}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className={`h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <CardTitle className={`text-lg font-bold ${iconColor} group-hover:brightness-125`}>
          {item.name || item.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}