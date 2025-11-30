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
    <Card className="bg-card border-border relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Icon className={`h-24 w-24 ${iconColor}`} />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-foreground">
          {value}{unit && <span className="text-lg text-muted-foreground">{unit}</span>}
        </div>
        <Badge variant="outline" className={`mt-2 ${classBadge}`}>{badge}</Badge>
      </CardContent>
    </Card>
  )
}
