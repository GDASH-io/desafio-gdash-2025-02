import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Cloud } from "lucide-react";
import { InsightsResponse } from "@/services/weather";

interface InsightsSectionProps {
  insights: InsightsResponse;
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Insights de IA
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-purple-50 rounded-lg p-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            {insights.summary}
          </p>
        </CardContent>
      </Card>

      {insights.recommendations.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg flex items-start gap-2"
                >
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

