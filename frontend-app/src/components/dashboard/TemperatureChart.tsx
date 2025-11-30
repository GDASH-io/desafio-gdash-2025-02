import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import colors from 'tailwindcss/colors'

export function TemperatureChart({ data }: { data: any[] }) {
  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground">Tendência de Temperatura (24h)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.blue[500]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors.blue[500]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="°C" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
              itemStyle={{ color: colors.blue[500] }}
            />
            <Area type="monotone" dataKey="temp" stroke={colors.blue[500]} strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
