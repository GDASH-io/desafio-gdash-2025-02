import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export function InsightsCard({ insights }: { insights?: { ai_analysis?: string[] } }) {
  return (
    <Card className="border-0 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Sparkles className="mr-2 h-5 w-5 text-yellow-300" /> IA Insights
        </CardTitle>
        <CardDescription className="text-indigo-100">Análise inteligente do ambiente</CardDescription>
      </CardHeader>
      <CardContent>
        {insights?.ai_analysis ? (
          <ul className="space-y-3">
            {insights.ai_analysis.map((msg, idx) => (
              <li key={idx} className="text-sm font-medium bg-white/10 p-2 rounded backdrop-blur-sm border border-white/10">
                {msg}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm opacity-70">Coletando dados para análise...</div>
        )}
      </CardContent>
    </Card>
  )
}
