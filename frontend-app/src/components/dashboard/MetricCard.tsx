import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  badge: string
  classBadge?: string
  icon: LucideIcon
  iconColor: string
}

export function MetricCard({ title, value, unit, badge, icon: Icon, iconColor, classBadge }: MetricCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Icon className={`h-24 w-24 ${iconColor}`} />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-slate-100">
          {value}{unit && <span className="text-lg text-slate-500">{unit}</span>}
        </div>
        <Badge variant="outline" className={`mt-2 ${classBadge}`}>{badge}</Badge>
      </CardContent>
    </Card>
  )
}
