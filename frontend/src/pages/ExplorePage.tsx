import { useEffect, useState } from "react";
import { api } from "../services/api";

interface PokemonItem {
  id: string;
  name: string;
  image: string;
}

interface PokemonListResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: PokemonItem[];
}

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  image: string;
  stats: { name: string; base: number }[];
}

export function ExplorePage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PokemonListResponse | null>(null);
  const [selected, setSelected] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const loadPage = async (pageToLoad: number) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/pokemon", {
        params: { page: pageToLoad, limit: 12 },
      });
      setData(res.data);
      setPage(pageToLoad);
      setSelected(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar Pokémons");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (idOrName: string) => {
    try {
      setLoadingDetail(true);
      const res = await api.get(`/api/pokemon/${idOrName}`);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar detalhes");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, []);

  return (
    <div className="space-y-8">
      {/* Título com imagem */}
      <img
        src="/assets/04_0006_Explorar-Pokémons.png"
        alt="Explorar Pokémons"
        className="h-8"
      />

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Container principal com fundo cinza */}
      <div
        className="relative rounded-lg overflow-hidden min-h-[600px] p-8"
        style={{
          backgroundImage: `url(/assets/04_0019_BOX-GRAY.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {loading && (
          <p className="text-slate-700 text-center py-8">Carregando lista...</p>
        )}

        {!loading && data && (
          <>
            {/* Grid de Pokémons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {data.results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadDetail(p.id)}
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-4 hover:bg-white/95 transition-all hover:shadow-lg flex flex-col items-center gap-3"
                >
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-20 h-20 object-contain"
                  />
                  <span className="font-semibold capitalize text-slate-800 text-sm">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Controles de paginação */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => loadPage(page - 1)}
                disabled={page <= 1}
                className="relative hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{
                  width: "120px",
                  height: "40px",
                  backgroundImage: `url(/assets/04_0018_SMALL-BUT.png)`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <span className="text-white text-sm font-semibold">
                  Anterior
                </span>
              </button>

              <p className="text-sm text-slate-700 font-medium">
                Página {page} de {data.totalPages}
              </p>

              <button
                onClick={() => loadPage(page + 1)}
                disabled={page >= data.totalPages}
                className="relative hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{
                  width: "120px",
                  height: "40px",
                  backgroundImage: `url(/assets/04_0018_SMALL-BUT.png)`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <span className="text-white text-sm font-semibold">
                  Próxima
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Detalhes do Pokémon selecionado */}
      {selected && (
        <div
          className="relative rounded-lg overflow-hidden p-6"
          style={{
            backgroundImage: `url(/assets/04_0019_BOX-GRAY.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {loadingDetail ? (
            <p className="text-slate-700">Carregando detalhes...</p>
          ) : (
            <>
              <div className="flex items-center gap-6 mb-6">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="w-32 h-32 object-contain"
                />
                <div>
                  <h2 className="text-3xl font-bold capitalize text-slate-900">
                    {selected.name}
                  </h2>
                  <p className="text-sm text-slate-700 mt-2">
                    <span className="font-semibold">Tipos:</span>{" "}
                    {selected.types.join(", ")}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Altura:</span> {selected.height} |{" "}
                    <span className="font-semibold">Peso:</span> {selected.weight}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selected.stats.map((s) => (
                  <div
                    key={s.name}
                    className="bg-white/60 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center"
                  >
                    <span className="capitalize text-sm text-slate-700 font-medium">
                      {s.name}
                    </span>
                    <span className="font-bold text-slate-900">{s.base}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
