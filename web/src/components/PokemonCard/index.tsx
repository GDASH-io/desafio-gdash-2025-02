import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  name: string;
  id: number;
}

export default function PokemonCard({ name, id }: Props) {
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const [details, setDetails] = useState<any>(null);

  const fetchDetails = async () => {
    const res = await fetch(`${API_URL}explorer/pokemons/${name}`);
    const data = await res.json();
    setDetails(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <div className="w-48 hover:shadow-lg transition border rounded p-2">
            <h3 className="capitalize text-center font-bold">{name}</h3>
            <img src={imageUrl} alt={name} className="w-32 h-32 mx-auto" />
            <p className="text-center text-gray-500">#{id}</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={fetchDetails}>
        <DialogHeader>
          <DialogTitle className="capitalize">{name}</DialogTitle>
        </DialogHeader>

        {details ? (
          <div className="space-y-2">
            <img
              src={imageUrl}
              alt={name}
              className="w-40 h-40 mx-auto mb-4"
            />
            <p><strong>ID:</strong> {details.id}</p>
            <p><strong>Tipo:</strong> {details.types?.map((t: any) => t.type.name).join(", ")}</p>
            <p><strong>Altura:</strong> {details.height}</p>
            <p><strong>Peso:</strong> {details.weight}</p>
            <p><strong>Habilidades:</strong> {details.abilities?.map((a: any) => a.ability.name).join(", ")}</p>
          </div>
        ) : (
          <p>Carregando detalhes...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
