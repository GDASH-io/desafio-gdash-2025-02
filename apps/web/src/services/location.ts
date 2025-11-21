export interface State {
  id: number
  sigla: string
  nome: string
}

export interface City {
  id: number
  nome: string
  latitude?: number
  longitude?: number
}

export interface GeocodingResult {
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string // Estado
}

// Busca todos os estados brasileiros da API do IBGE
export async function fetchStates(): Promise<State[]> {
  const response = await fetch(
    'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
  )
  return response.json()
}

// Busca cidades de um estado da API do IBGE
export async function fetchCitiesByState(stateId: number): Promise<City[]> {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios?orderBy=nome`
  )
  return response.json()
}

// Busca coordenadas de uma cidade usando Open-Meteo Geocoding API
export async function fetchCityCoordinates(
  cityName: string,
  stateName: string
): Promise<GeocodingResult | null> {
  // Buscar só pelo nome da cidade e filtrar pelo estado
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=pt&format=json`
  )
  const data = await response.json()

  if (data.results && data.results.length > 0) {
    // Filtrar por país Brasil e estado correto
    const match = data.results.find(
      (r: { country: string; admin1?: string }) =>
        r.country === 'Brasil' && r.admin1 === stateName
    )

    if (match) {
      return {
        name: match.name,
        latitude: match.latitude,
        longitude: match.longitude,
        country: match.country,
        admin1: match.admin1,
      }
    }

    // Fallback: primeiro resultado do Brasil
    const brazilResult = data.results.find(
      (r: { country: string }) => r.country === 'Brasil'
    )
    if (brazilResult) {
      return {
        name: brazilResult.name,
        latitude: brazilResult.latitude,
        longitude: brazilResult.longitude,
        country: brazilResult.country,
        admin1: brazilResult.admin1,
      }
    }
  }

  return null
}
