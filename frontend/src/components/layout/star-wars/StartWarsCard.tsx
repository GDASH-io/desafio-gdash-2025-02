import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StarWarsPerson } from "@/interfaces/starWars";

interface StarWarsCardProps {
  person: StarWarsPerson;
}

export function StarWarsCard({ person }: StarWarsCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-50">
          {person.name}
        </CardTitle>
        <p className="text-xs text-slate-400">
          Nasc.: {person.birth_year} • Gênero: {person.gender}
        </p>
      </CardHeader>

      <CardContent className="text-sm text-slate-200 space-y-1">
        <p>
          <span className="text-slate-400">Altura:</span> {person.height} cm
        </p>
        <p>
          <span className="text-slate-400">Peso:</span> {person.mass} kg
        </p>
        <p>
          <span className="text-slate-400">Cabelo:</span> {person.hair_color}
        </p>
        <p>
          <span className="text-slate-400">Pele:</span> {person.skin_color}
        </p>
        <p>
          <span className="text-slate-400">Olhos:</span> {person.eye_color}
        </p>
      </CardContent>
    </Card>
  );
}
