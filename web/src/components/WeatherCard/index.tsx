import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface WeatherCardProps {
  title: string;
  value: string | number;
  unit?: string;
}

export default function WeatherCard({ title, value, unit }: WeatherCardProps) {
  return (
    <Card className="w-48">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {value} {unit}
        </p>
      </CardContent>
    </Card>
  );
}
