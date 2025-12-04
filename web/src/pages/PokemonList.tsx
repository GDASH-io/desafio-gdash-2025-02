import { useEffect, useState } from "react";
import PokemonCard from "../components/PokemonCard";
import { Button } from "@/components/ui/button";

export default function PokemonList() {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [pageUrl, setPageUrl] = useState("https://pokeapi.co/api/v2/pokemon?limit=10");
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(pageUrl)
      .then((res) => res.json())
      .then((data) => {
        setPokemons(data.results);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
      });
  }, [pageUrl]); // 👈 só dispara quando pageUrl muda

  const getIdFromUrl = (url: string) => {
    const parts = url.split("/").filter(Boolean);
    return parseInt(parts[parts.length - 1]);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">🟡 Lista de Pokémons</h1>

      <div className="grid grid-cols-4 gap-4">
        {pokemons.map((p) => (
          <PokemonCard key={p.name} name={p.name} id={getIdFromUrl(p.url)} />
        ))}
      </div>

      <div className="flex gap-4 justify-center mt-6">
        <Button disabled={!prevUrl} onClick={() => setPageUrl(prevUrl!)}>
          Anterior
        </Button>
        <Button disabled={!nextUrl} onClick={() => setPageUrl(nextUrl!)}>
          Próxima
        </Button>
      </div>
    </div>
  );
}
