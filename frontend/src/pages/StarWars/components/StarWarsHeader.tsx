import { Rocket } from "lucide-react";

export function StarWarsHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Rocket className="h-6 w-6 text-indigo-700" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Frota Estelar</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Catálogo oficial de naves (SWAPI).
          </p>
        </div>
      </div>
    </div>
  );
}
