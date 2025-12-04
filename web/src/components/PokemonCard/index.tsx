import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  name: string;
  id: number;
}

export default function PokemonCard({ name, id }: Props) {
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  return (
    <Card className="w-48 hover:shadow-lg transition">
      <CardHeader>
        <CardTitle className="capitalize">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <img src={imageUrl} alt={name} className="w-32 h-32 mx-auto" />
        <p className="text-center text-gray-500">#{id}</p>
      </CardContent>
    </Card>
  );
}
