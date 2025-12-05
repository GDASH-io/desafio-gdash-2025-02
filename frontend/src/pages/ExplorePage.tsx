import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { SidebarLayout } from "../components/Sidebar";

interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
}

interface PokemonListResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: PokemonListItem[];
}

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: { name: string; base: number }[];
  sprite: string;
}

export function ExplorePage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [data, setData] = useState<PokemonListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PokemonDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }

  async function loadPage(p: number) {
    const headers = getAuthHeaders();
    if (!headers) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      const res = await api.get<PokemonListResponse>("/poke/pokemon", {
        params: { page: p, limit: 12 },
        headers,
      });
      setData(res.data);
      setPage(p);
    } catch (err: any) {
      console.error("Erro ao carregar lista de Pokémons:", err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(name: string) {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setDetailLoading(true);
      const res = await api.get<PokemonDetail>(`/poke/pokemon/${name}`, {
        headers,
      });
      setSelected(res.data);
    } catch (err) {
      console.error("Erro ao carregar detalhes:", err);
      alert("Erro ao carregar detalhes do Pokémon.");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    loadPage(1);
  }, []);

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Explorar API Pública</h1>
            <p className="text-sm text-slate-400">
              Integração com a PokéAPI via backend NestJS.
            </p>
          </div>
        </header>

        {/* Lista de pokémons */}
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pokémons</h2>
            {data && (
              <span className="text-xs text-slate-400">
                Página {data.page} de {data.totalPages}
              </span>
            )}
          </div>

          {loading || !data ? (
            <p className="text-sm text-slate-300">Carregando lista...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.results.map((poke) => (
                  <button
                    key={poke.id}
                    onClick={() => loadDetail(poke.name)}
                    className="flex flex-col items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg p-3 hover:border-emerald-400 hover:bg-slate-800 transition"
                  >
                    <img
                      src={poke.sprite}
                      alt={poke.name}
                      className="w-16 h-16"
                    />
                    <span className="text-xs text-slate-400">
                      #{poke.id.toString().padStart(3, "0")}
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {poke.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => loadPage(page - 1)}
                  className="px-3 py-1 text-sm rounded bg-slate-800 border border-slate-700 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={data.page >= data.totalPages}
                  onClick={() => loadPage(page + 1)}
                  className="px-3 py-1 text-sm rounded bg-slate-800 border border-slate-700 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </>
          )}
        </section>

        {/* Detalhe do Pokémon */}
        {selected && (
          <section className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={selected.sprite}
                  alt={selected.name}
                  className="w-32 h-32"
                />
                <span className="text-xs text-slate-400">
                  #{selected.id.toString().padStart(3, "0")}
                </span>
                <span className="text-lg font-semibold capitalize">
                  {selected.name}
                </span>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Informações</h3>
                  <p className="text-sm text-slate-300">
                    Altura: {selected.height}
                  </p>
                  <p className="text-sm text-slate-300">
                    Peso: {selected.weight}
                  </p>
                  <p className="text-sm text-slate-300">
                    Tipos:{" "}
                    <span className="capitalize">
                      {selected.types.join(", ")}
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-1">Habilidades</h3>
                  <p className="text-sm text-slate-300 capitalize">
                    {selected.abilities.join(", ")}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold mb-1">Atributos</h3>
                  <div className="space-y-1">
                    {selected.stats.map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between text-xs text-slate-300"
                      >
                        <span className="capitalize">{s.name}</span>
                        <span className="font-mono">{s.base}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {detailLoading && (
              <p className="text-xs text-slate-400 mt-2">
                Atualizando detalhes...
              </p>
            )}
          </section>
        )}
      </div>
    </SidebarLayout>
  );
}
