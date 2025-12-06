import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ComfortIndex {
  score: number;
  classification: string;
  recommendations: string[];
}

interface ComfortIndexCardProps {
  comfort: ComfortIndex | undefined;
}

export function ComfortIndexCard({ comfort }: ComfortIndexCardProps) {
  if (!comfort || comfort.score === undefined) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Índice de Conforto</CardTitle>
        <CardDescription>Análise das condições atuais</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{comfort.score}</div>
          <p className="text-lg font-medium capitalize">
            {comfort.classification.replace(/_/g, " ")}
          </p>
          {comfort.recommendations && (
            <div className="mt-4 text-left space-y-1">
              {comfort.recommendations.map((rec, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  • {rec}
                </p>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
