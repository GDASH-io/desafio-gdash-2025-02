import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '../services/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

// Constantes de configuração
const ITEMS_PER_PAGE = 20
const FAVORITES_PER_PAGE = 20
const FILTERED_TYPES = ['stellar', 'unknown']
const MAX_STAT_VALUE = 255

// Ícones simples
const HeartIcon = ({ filled }: { filled: boolean }) => <span>{filled ? '❤️' : '🤍'}</span>
const StatsIcon = () => <span>📊</span>
const FilterIcon = () => <span>🎯</span>
const RefreshIcon = () => <span>🔄</span>

// Tipos
interface Pokemon {
  id: number
  name: string
  url: string
  height: number
  weight: number
  base_experience: number
  types: Array<{
    type: {
      name: string
    }
  }>
  sprites: {
    front_default: string
    other: {
      'official-artwork': {
        front_default: string
      }
    }
  }
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
}

interface PokemonListItem {
  name: string
  url: string
}

interface PokemonType {
  name: string
  url: string
}

export function PokemonPage() {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([])
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [pokemonTypes, setPokemonTypes] = useState<PokemonType[]>([])
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [includeAlternativeForms, setIncludeAlternativeForms] = useState(false)
  const [favoritesPage, setFavoritesPage] = useState(1)
  const [pokemonNames, setPokemonNames] = useState<Map<number, string>>(new Map())
  const [pokemonTypesCache, setPokemonTypesCache] = useState<Map<number, string[]>>(new Map())
  const [favoriteSearchTerm, setFavoriteSearchTerm] = useState('')
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchPokemonTypes()
    loadFavorites()
  }, [])

  useEffect(() => {
    // Implementar debounce na busca para evitar chamadas excessivas
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }
    
    const newDebounce = setTimeout(() => {
      if (searchTerm || selectedType) {
        handleSearch(1) // Sempre começar da página 1 quando filtros mudam
      } else if (!showOnlyFavorites) {
        // Limpar lista imediatamente ao voltar para modo normal
        setPokemonList([])
        setCurrentPage(1)
        fetchPokemonList()
      }
    }, 300) // 300ms de debounce
    
    setSearchDebounce(newDebounce)
    
    return () => {
      if (newDebounce) {
        clearTimeout(newDebounce)
      }
    }
  }, [searchTerm, selectedType, includeAlternativeForms, showOnlyFavorites])

  useEffect(() => {
    if (showOnlyFavorites) {
      // Limpar lista imediatamente ao entrar no modo favoritos
      setPokemonList([])
      setCurrentPage(1)
      setFavoritesPage(1)
      // Buscar nomes e tipos dos Pokémon favoritos quando necessário
      const fetchFavoriteData = async () => {
        setLoading(true)
        try {
          const idsToFetch = Array.from(favorites).filter(id => !pokemonNames.has(id) || !pokemonTypesCache.has(id))
          if (idsToFetch.length > 0) {
            await Promise.all(idsToFetch.map(async (id) => {
              await Promise.all([getPokemonName(id), getPokemonTypes(id)])
            }))
          }
        } catch (error) {
          console.error('Erro ao buscar dados dos favoritos:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchFavoriteData()
    }
  }, [showOnlyFavorites, favorites, includeAlternativeForms, selectedType])

  const fetchPokemonList = useCallback(async () => {
    try {
      setLoading(true)
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      const response = await api.get(`/api/pokemon?limit=${ITEMS_PER_PAGE}&offset=${offset}&includeAlternativeForms=${includeAlternativeForms}`)
      
      setPokemonList(response.data.results)
      setTotalCount(response.data.count)
      setTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE))
    } catch (error) {
      console.error('Erro ao carregar lista de Pokémon:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, includeAlternativeForms])

  const fetchPokemonTypes = useCallback(async () => {
    try {
      const response = await api.get('/api/pokemon/types')
      // Filtrar tipos desnecessários
      const filteredTypes = response.data.results.filter((type: PokemonType) => 
        !FILTERED_TYPES.includes(type.name.toLowerCase())
      )
      setPokemonTypes(filteredTypes)
    } catch (error) {
      console.error('Erro ao carregar tipos de Pokémon:', error)
    }
  }, [])

  const handleSearch = useCallback(async (page: number = 1) => {
    // Se não há termo de busca nem filtro de tipo, volta para listagem normal
    if (!searchTerm.trim() && !selectedType) {
      return fetchPokemonList()
    }

    try {
      setSearchLoading(true)
      const offset = (page - 1) * ITEMS_PER_PAGE

      const params = new URLSearchParams()
      if (searchTerm.trim()) {
        // Busca parcial: enviar termo para busca por substring
        params.append('name', searchTerm.trim())
        params.append('partial', 'true') // Flag para busca parcial
      }
      if (selectedType) {
        params.append('type', selectedType)
      }
      params.append('limit', ITEMS_PER_PAGE.toString())
      params.append('offset', offset.toString())
      params.append('includeAlternativeForms', includeAlternativeForms.toString())

      const response = await api.get(`/api/pokemon/search?${params.toString()}`)
      let results = response.data.results || []
      
      // Busca parcial garantida no frontend (fallback + complemento)
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase()
        
        // Se a API não retornou resultados parciais suficientes, fazer busca local mais ampla
        if (results.length === 0 || !results.some((p: any) => p.name.toLowerCase().startsWith(term))) {
          // Buscar na lista completa se necessário
          try {
            const fullListResponse = await api.get(`/api/pokemon?limit=2000&includeAlternativeForms=${includeAlternativeForms}`)
            const fullResults = fullListResponse.data.results || []
            
            // Filtrar localmente por substring no nome ou ID
        const localFiltered = fullResults.filter((pokemon: any) => {
          const id = parseInt(pokemon.url.split('/').slice(-2, -1)[0])
          const name = pokemon.name.toLowerCase()
          const idStr = id.toString()
        
          return (
            name.startsWith(term) || 
            idStr.startsWith(searchTerm.trim())
          )
        })

            
            // Se encontrou resultados localmente, usar eles
            if (localFiltered.length > 0) {
              // Aplicar paginação aos resultados filtrados
              const startIndex = (page - 1) * ITEMS_PER_PAGE
              results = localFiltered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
              setTotalCount(localFiltered.length)
              setTotalPages(Math.ceil(localFiltered.length / ITEMS_PER_PAGE))
            }
          } catch (fallbackError) {
            console.warn('Fallback search failed:', fallbackError)
          }
        } else {
          // API retornou resultados, usar contagem da API
          setTotalCount(response.data.count || results.length)
          setTotalPages(Math.ceil((response.data.count || results.length) / ITEMS_PER_PAGE))
        }
      } else {
        // Sem busca de texto, usar resultados da API normalmente
        setTotalCount(response.data.count || results.length)
        setTotalPages(Math.ceil((response.data.count || results.length) / ITEMS_PER_PAGE))
      }
      
      setPokemonList(results)
      setCurrentPage(page)
    } catch (error) {
      console.error('Erro na busca:', error)
      setPokemonList([])
      setTotalCount(0)
      setTotalPages(0)
    } finally {
      setSearchLoading(false)
    }
  }, [searchTerm, selectedType, includeAlternativeForms, fetchPokemonList])


  const loadFavorites = useCallback(() => {
    const saved = localStorage.getItem('pokemonFavorites')
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)))
    }
  }, [])

  const saveFavorites = useCallback((newFavorites: Set<number>) => {
    localStorage.setItem('pokemonFavorites', JSON.stringify(Array.from(newFavorites)))
    setFavorites(newFavorites)
  }, [])

  const toggleFavorite = useCallback((pokemonId: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(pokemonId)) {
      newFavorites.delete(pokemonId)
    } else {
      newFavorites.add(pokemonId)
    }
    saveFavorites(newFavorites)
  }, [favorites, saveFavorites])

  const fetchPokemonDetails = useCallback(async (url: string) => {
    try {
      setLoading(true)
      const pokemonId = url.split('/').slice(-2, -1)[0]
      const response = await api.get(`/api/pokemon/${pokemonId}`)
      setSelectedPokemon(response.data)
    } catch (error) {
      console.error('Erro ao carregar detalhes do Pokémon:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const getPokemonName = useCallback(async (id: number): Promise<string> => {
    if (pokemonNames.has(id)) {
      const name = pokemonNames.get(id)
      if (typeof name === 'string') {
        return name
      }
    }
    
    try {
      const response = await api.get(`/api/pokemon/${id}`)
      const name = String(response.data.name || `Pokemon ${id}`)
      setPokemonNames(prev => new Map(prev.set(id, name)))
      return name
    } catch (error) {
      console.error('Erro ao buscar nome do Pokémon:', error)
      return `Pokemon ${id}`
    }
  }, [pokemonNames])

  const getPokemonTypes = useCallback(async (id: number): Promise<string[]> => {
    if (pokemonTypesCache.has(id)) {
      const types = pokemonTypesCache.get(id)
      if (Array.isArray(types)) {
        return types
      }
    }
    
    try {
      const response = await api.get(`/api/pokemon/${id}`)
      const types = response.data.types?.map((typeInfo: any) => String(typeInfo.type?.name || '')) || []
      setPokemonTypesCache(prev => new Map(prev.set(id, types)))
      return types
    } catch (error) {
      console.error('Erro ao buscar tipos do Pokémon:', error)
      return []
    }
  }, [pokemonTypesCache])

  const getDisplayName = useCallback((pokemon: PokemonListItem, pokemonId: number): string => {
    try {
      if (showOnlyFavorites) {
        const cachedName = pokemonNames.get(pokemonId)
        if (cachedName && typeof cachedName === 'string' && cachedName.trim() !== '') {
          return cachedName
        }
        return loading ? 'Carregando...' : `Pokemon ${pokemonId}`
      }
      const name = pokemon.name || `Pokemon ${pokemonId}`
      return typeof name === 'string' ? name : `Pokemon ${pokemonId}`
    } catch (error) {
      console.error('Erro ao obter nome do Pokémon:', error)
      return `Pokemon ${pokemonId}`
    }
  }, [showOnlyFavorites, pokemonNames, loading])

  const typeColors = useMemo(() => ({
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-700',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
  }), [])

  const getTypeColor = useCallback((type: string) => {
    return typeColors[type] || 'bg-gray-400'
  }, [typeColors])

  const filteredPokemonList = useMemo(() => {
    return showOnlyFavorites 
      ? pokemonList.filter(pokemon => {
          const id = parseInt(pokemon.url.split('/').slice(-2, -1)[0])
          return favorites.has(id)
        })
      : pokemonList
  }, [showOnlyFavorites, pokemonList, favorites])

  // Quando favoritos está ativo, mostra todos os favoritos disponíveis filtrados por formas alternativas e tipo
  const [filteredFavorites, setFilteredFavorites] = useState<number[]>([])

  useEffect(() => {
    if (showOnlyFavorites) {
      const filterFavorites = async () => {
        try {
          let filtered = Array.from(favorites)
          
          // Filtrar por formas alternativas
          if (!includeAlternativeForms) {
            filtered = filtered.filter(id => id < 10000)
          }
          
          // Filtrar por tipo se selecionado
          if (selectedType) {
            const typeFiltered: number[] = []
            for (const id of filtered) {
              try {
                const types = await getPokemonTypes(id)
                if (types.includes(selectedType)) {
                  typeFiltered.push(id)
                }
              } catch (error) {
                console.error(`Erro ao verificar tipos do Pokémon ${id}:`, error)
              }
            }
            filtered = typeFiltered
          }
          
          // Filtrar por busca de texto se estiver no modo favoritos
          if (searchTerm.trim()) {
            const searchFiltered: number[] = []
            for (const id of filtered) {
              try {
                const name = await getPokemonName(id)
                // Busca parcial: verificar se o nome contém o termo de busca
                if (name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    id.toString().includes(searchTerm)) {
                  searchFiltered.push(id)
                }
              } catch (error) {
                console.error(`Erro ao verificar nome do Pokémon ${id}:`, error)
              }
            }
            filtered = searchFiltered
          }
          
          setFilteredFavorites(filtered)
        } catch (error) {
          console.error('Erro ao filtrar favoritos:', error)
          setFilteredFavorites([])
        }
      }
      
      filterFavorites()
    } else {
      // Limpar filteredFavorites quando não está no modo favoritos
      setFilteredFavorites([])
      setFavoritesPage(1)
      
    }
  }, [showOnlyFavorites, favorites, includeAlternativeForms, selectedType, searchTerm])

  const favoritesList = showOnlyFavorites ? filteredFavorites.map(id => ({
    name: `pokemon-${id}`,
    url: `https://pokeapi.co/api/v2/pokemon/${id}/`
  })) : []

  // Paginação local para favoritos
  const paginatedFavorites = useMemo(() => {
    return showOnlyFavorites 
      ? filteredFavorites.slice((favoritesPage - 1) * FAVORITES_PER_PAGE, favoritesPage * FAVORITES_PER_PAGE)
          .map(id => ({
            name: `pokemon-${id}`,
            url: `https://pokeapi.co/api/v2/pokemon/${id}/`
          }))
      : []
  }, [showOnlyFavorites, filteredFavorites, favoritesPage])

  const totalFavoritesPages = useMemo(() => {
    return showOnlyFavorites ? Math.ceil(filteredFavorites.length / FAVORITES_PER_PAGE) : 0
  }, [showOnlyFavorites, filteredFavorites.length])

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Explorar Pokémons</h1>
          <p className="text-muted-foreground">Integração completa com PokéAPI</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={showOnlyFavorites ? "default" : "outline"}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          > 
            <HeartIcon filled={showOnlyFavorites} />
            <span className="ml-2">Favoritos ({favorites.size})</span>
          </Button>
          <Button variant="outline" onClick={() => {
            if (showOnlyFavorites) {
              setFavoritesPage(1)
            } else if (searchTerm || selectedType) {
              handleSearch(1) // Recarrega com filtros atuais
            } else {
              fetchPokemonList() // Recarrega listagem geral
            }
          }}>
            <RefreshIcon />
            <span className="ml-2">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-card border rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium">Buscar Pokémon</label>
          <div className="flex space-x-2">
            <Input
              placeholder={showOnlyFavorites ? "Buscar nos favoritos (nome ou ID)..." : "Nome ou ID do Pokémon (busca parcial)..."}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!showOnlyFavorites) {
                    handleSearch()
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Filtrar por Tipo</label>
          <div className="flex space-x-2">
            <select
              className="flex-1 p-2 border rounded-md"
              value={selectedType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              {pokemonTypes.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </option>
              ))}
            </select>
            {(searchTerm || selectedType) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedType('')
                  setCurrentPage(1)
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Opções</label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeAlternativeForms"
              checked={includeAlternativeForms}
              onChange={(e) => setIncludeAlternativeForms(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="includeAlternativeForms" className="text-sm">
              Incluir formas alternativas
            </label>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Estatísticas</label>
          <div className="text-sm text-muted-foreground">
            <div>
              {showOnlyFavorites ? (
                <>
                  Total de Favoritos: {filteredFavorites.length} Pokémons
                  {selectedType && <span className="text-blue-600 font-medium"> ({selectedType})</span>}
                </>
              ) : (
                <>
                  Total: {totalCount} Pokémons
                  {selectedType && <span className="text-blue-600 font-medium"> ({selectedType})</span>}
                  {!selectedType && !searchTerm && <span className="text-green-600 font-medium"> (Todos os tipos)</span>}
                </>
              )}
            </div>
            <div>Favoritos: {favorites.size}</div>
            <div>
              Página: {showOnlyFavorites ? favoritesPage : currentPage}/{showOnlyFavorites ? totalFavoritesPages : totalPages}
            </div>
            {(searchTerm || selectedType) && (
              <div className="text-xs text-blue-600 mt-1">
                🔍 Filtros ativos{showOnlyFavorites && searchTerm ? ' (busca nos favoritos)' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Pokémons */}
        <div className="space-y-4">

          
          {loading && !searchLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando Pokémons...</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                <FilterIcon />
                <span className="ml-2">
                  {showOnlyFavorites ? 'Pokémons Favoritos' : 'Lista de Pokémons'}
                  {showOnlyFavorites 
                    ? ` (${filteredFavorites.length})` 
                    : ` (${totalCount})`
                  }
                </span>
              </h2>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {(showOnlyFavorites ? paginatedFavorites : filteredPokemonList).map((pokemon) => {
                  const pokemonId = parseInt(pokemon.url.split('/').slice(-2, -1)[0])
                  const isFavorite = favorites.has(pokemonId)
                  
                  return (
                    <div
                      key={pokemon.name}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => fetchPokemonDetails(pokemon.url)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm ${pokemonId > 10000 ? 'text-purple-600 font-bold' : 'text-muted-foreground'}`}>
                          #{pokemonId > 10000 ? `${pokemonId}*` : pokemonId.toString().padStart(3, '0')}
                        </span>
                        <span className="font-medium capitalize">{getDisplayName(pokemon, pokemonId)}</span>
                        {pokemonId > 10000 && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Forma Alternativa
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(pokemonId)
                        }}
                      >
                        <HeartIcon filled={isFavorite} />
                      </Button>
                    </div>
                  )
                })}
                
                {(showOnlyFavorites ? paginatedFavorites : filteredPokemonList).length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    {showOnlyFavorites ? 'Nenhum favorito encontrado' : 'Nenhum Pokémon encontrado'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paginação */}
          {((!showOnlyFavorites && totalPages > 1) || (showOnlyFavorites && totalFavoritesPages > 1)) && (
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (showOnlyFavorites) {
                    const newPage = Math.max(1, favoritesPage - 1)
                    setFavoritesPage(newPage)
                  } else {
                    const newPage = Math.max(1, currentPage - 1)
                    setCurrentPage(newPage)
                    if (selectedType && !searchTerm) {
                      handleSearch(newPage)
                    }
                  }
                }}
                disabled={(showOnlyFavorites ? favoritesPage : currentPage) === 1 || loading}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {showOnlyFavorites ? favoritesPage : currentPage} de {showOnlyFavorites ? totalFavoritesPages : totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  if (showOnlyFavorites) {
                    const newPage = Math.min(totalFavoritesPages, favoritesPage + 1)
                    setFavoritesPage(newPage)
                  } else {
                    const newPage = Math.min(totalPages, currentPage + 1)
                    setCurrentPage(newPage)
                    if (selectedType && !searchTerm) {
                      handleSearch(newPage)
                    }
                  }
                }}
                disabled={(showOnlyFavorites ? favoritesPage : currentPage) === (showOnlyFavorites ? totalFavoritesPages : totalPages) || loading}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>

        {/* Detalhes do Pokémon */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <StatsIcon />
            <span className="ml-2">Detalhes do Pokémon</span>
          </h2>
          
          {selectedPokemon ? (
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold capitalize">{selectedPokemon.name}</h3>
                  <p className="text-muted-foreground">#{selectedPokemon.id.toString().padStart(3, '0')}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => toggleFavorite(selectedPokemon.id)}
                >
                  <HeartIcon filled={favorites.has(selectedPokemon.id)} />
                </Button>
              </div>

              {/* Imagem */}
              <div className="flex justify-center">
                <img
                  src={selectedPokemon.sprites.other?.['official-artwork']?.front_default || selectedPokemon.sprites.front_default}
                  alt={selectedPokemon.name}
                  className="w-48 h-48 object-contain"
                />
              </div>

              {/* Tipos */}
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedPokemon.types.map((typeInfo) => (
                  <span
                    key={typeInfo.type.name}
                    className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getTypeColor(typeInfo.type.name)}`}
                  >
                    {typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
                  </span>
                ))}
              </div>

              {/* Informações físicas */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{(selectedPokemon.height / 10).toFixed(1)}m</p>
                  <p className="text-sm text-muted-foreground">Altura</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{(selectedPokemon.weight / 10).toFixed(1)}kg</p>
                  <p className="text-sm text-muted-foreground">Peso</p>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="space-y-2">
                <h4 className="font-semibold">Estatísticas Base</h4>
                {selectedPokemon.stats.map((statInfo) => (
                  <div key={statInfo.stat.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{statInfo.stat.name.replace('-', ' ')}</span>
                      <span className="font-medium">{statInfo.base_stat}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (statInfo.base_stat / MAX_STAT_VALUE) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Experiência base */}
              {selectedPokemon.base_experience && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg font-semibold text-blue-800">{selectedPokemon.base_experience} XP</p>
                  <p className="text-sm text-blue-600">Experiência Base</p>
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              <StatsIcon />
              <p className="mt-2">Selecione um Pokémon para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}