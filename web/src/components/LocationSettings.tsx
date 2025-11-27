import { useState } from 'react'
import { api } from '../services/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

interface LocationData {
  city: string
  state: string
  country: string
  countryCode: string
}

interface LocationSettingsProps {
  onLocationUpdate: (location: LocationData) => void
}

export function LocationSettings({ onLocationUpdate }: LocationSettingsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cep, setCep] = useState('')
  const [cityName, setCityName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCepSearch = async () => {
    if (!cep.trim()) {
      setError('Digite um CEP válido')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await api.get(`/api/location/by-cep?cep=${cep}`)
      const locationData = response.data
      
      // Configurar o coletor para essa localização
      await configureWeatherCollection(locationData)
      
      // Adicionar dados aos recentes automaticamente
      try {
        await addToRecentData(locationData)
        console.log('✅ Dados adicionados com sucesso para:', locationData.city)
      } catch (addError: any) {
        console.warn('⚠️ Falha ao adicionar dados aos recentes:', addError.message)
        // Continua mesmo se falhar, pois é funcionalidade auxiliar
      }
      
      // Atualizar dados e interface
      onLocationUpdate(locationData)
      
      
      // Salvar nos localStorage para próxima sessão
      localStorage.setItem('userLocation', JSON.stringify(locationData))
      
      // Forçar atualização dos dados no dashboard
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshWeatherData'))
      }, 2000)
      
      setIsModalOpen(false)
      setCep('')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'CEP não encontrado ou inválido. Verifique o formato (ex: 12345-678) e tente novamente.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCitySearch = async () => {
    console.log('🏙️ INICIO handleCitySearch - Cidade digitada:', cityName)
    
    if (!cityName.trim()) {
      console.warn('❌ Nome da cidade vazio')
      setError('Digite o nome da cidade')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('📍 Buscando localização para cidade:', cityName)
      const response = await api.get(`/api/location/by-city?city=${encodeURIComponent(cityName)}`)
      const locationData = response.data
      console.log('📍 Dados da localização recebidos:', locationData)
      
      // Configurar o coletor para essa localização
      console.log('⚙️ Configurando coletor de dados...')
      await configureWeatherCollection(locationData)
      
      // Adicionar dados aos recentes automaticamente
      try {
        console.log('📊 CHAMANDO addToRecentData para:', locationData.city)
        await addToRecentData(locationData)
        console.log('✅ addToRecentData executada com SUCESSO para:', locationData.city)
      } catch (addError: any) {
        console.error('❌ FALHA em addToRecentData:', addError.message)
        console.error('❌ Detalhes do erro:', addError)
        // Continua mesmo se falhar, pois é funcionalidade auxiliar
      }
      
      // Atualizar dados e interface
      console.log('🔄 Atualizando interface...')
      onLocationUpdate(locationData)
      
      // Salvar nos localStorage para próxima sessão
      localStorage.setItem('userLocation', JSON.stringify(locationData))
      
      // Forçar atualização dos dados no dashboard
      setTimeout(() => {
        console.log('🔄 Disparando evento de refresh no dashboard')
        window.dispatchEvent(new CustomEvent('refreshWeatherData'))
      }, 2000) // Aumentado para 2s
      
      setIsModalOpen(false)
      setCityName('')
      console.log('✅ handleCitySearch CONCLUÍDA com sucesso')
    } catch (error: any) {
      console.error('❌ Erro em handleCitySearch:', error)
      const errorMessage = error.response?.data?.message || 'Cidade não encontrada. Tente um nome de cidade diferente (ex: Rio de Janeiro, Belo Horizonte).'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoDetect = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.get('/api/location/by-ip')
      const locationData = response.data
      
      // Configurar o coletor para essa localização
      await configureWeatherCollection(locationData)
      
      // Adicionar dados aos recentes automaticamente
      try {
        await addToRecentData(locationData)
        console.log('✅ Dados adicionados com sucesso para:', locationData.city)
      } catch (addError: any) {
        console.warn('⚠️ Falha ao adicionar dados aos recentes:', addError.message)
        // Continua mesmo se falhar, pois é funcionalidade auxiliar
      }
      
      // Atualizar dados e interface
      onLocationUpdate(locationData)
      
      // Salvar nos localStorage para próxima sessão
      localStorage.setItem('userLocation', JSON.stringify(locationData))
      
      // Forçar atualização dos dados no dashboard
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshWeatherData'))
      }, 2000)
      
      setIsModalOpen(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Não foi possível detectar sua localização automaticamente. Tente buscar manualmente por CEP ou nome da cidade.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const configureWeatherCollection = async (locationData: LocationData) => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        await api.post('/api/config/location', {
          city: locationData.city,
          country: locationData.countryCode,
          state: locationData.state
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.warn('Não foi possível configurar a coleta automática:', error)
      // Não mostrar erro para o usuário, é uma funcionalidade auxiliar
    }
  }

  const addToRecentData = async (locationData: LocationData) => {
    try {
      console.log('🌤️ INICIO - Função addToRecentData executando para:', locationData.city, locationData.countryCode)
      
      // Verificar se temos token de autenticação
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      console.log('🔑 Token disponível:', token ? 'SIM' : 'NÃO')
      
      if (!token) {
        console.warn('⚠️ Nenhum token de autenticação encontrado')
      }
      
      // Buscar dados meteorológicos atuais para a localização
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationData.city)},${locationData.countryCode}&appid=728d82f118a955537334a4d41b2298f7&units=metric&lang=pt_br`
      console.log('🔗 URL da busca OpenWeatherMap:', weatherUrl)
      
      console.log('📡 Fazendo requisição para OpenWeatherMap...')
      const weatherResponse = await fetch(weatherUrl)
      
      if (!weatherResponse.ok) {
        console.error('❌ Erro na resposta do OpenWeatherMap:', weatherResponse.status, weatherResponse.statusText)
        throw new Error(`Erro OpenWeatherMap ${weatherResponse.status}: ${weatherResponse.statusText}`)
      }
      
      const weatherData = await weatherResponse.json()
      console.log('🌡️ Dados meteorológicos recebidos do OpenWeatherMap:', {
        name: weatherData.name,
        temp: weatherData.main?.temp,
        description: weatherData.weather?.[0]?.description
      })
      
      // Preparar dados no formato do backend
      const weatherLog: any = {
        city: weatherData.name,
        country: locationData.countryCode,
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind ? weatherData.wind.speed : 0,
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility || 10000,
        cloudiness: weatherData.clouds ? weatherData.clouds.all : 0,
        timestamp: new Date().toISOString(),
      }

      // Adicionar nascer/pôr do sol se disponível
      if (weatherData.sys) {
        if (weatherData.sys.sunrise) {
          weatherLog.sunrise = new Date(weatherData.sys.sunrise * 1000).toISOString()
        }
        if (weatherData.sys.sunset) {
          weatherLog.sunset = new Date(weatherData.sys.sunset * 1000).toISOString()
        }
      }
      
      console.log('📤 DADOS PREPARADOS para envio ao backend:', weatherLog)
      
      // Enviar para o backend (endpoint correto)
      console.log('📡 Fazendo POST para /api/weather/logs...')
      const response = await api.post('/api/weather/logs', weatherLog)
      console.log('✅ SUCESSO! Resposta do backend:', {
        status: response.status,
        data: response.data
      })
      
      return true
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO na função addToRecentData:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
        city: locationData.city
      })
      
      // Log adicional se for erro de rede/CORS
      if (error.response) {
        console.error('❌ Erro HTTP:', error.response.status, error.response.data)
      } else if (error.request) {
        console.error('❌ Erro de rede/CORS:', error.request)
      } else {
        console.error('❌ Erro desconhecido:', error.message)
      }
      
      throw error // Re-throw para que a UI possa mostrar erro se necessário
    }
  }

  return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="default" className="bg-green-500 hover:bg-green-600 text-white font-medium">
          📍 Configurar Localização
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Sua Localização</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Auto Detect - Método Padrão */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              🎯 Detecção Automática (Recomendado)
            </h4>
            <Button 
              onClick={handleAutoDetect} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-md"
            >
              {loading ? 'Detectando sua localização...' : '🌍 Detectar Automaticamente Pelo PC'}
            </Button>
            <p className="text-xs text-green-700 mt-3 text-center font-medium">
              ✅ Usa a localização real do seu PC automaticamente<br/>
              📍 Mesma tecnologia do sistema de coleta de dados
            </p>
          </div>

          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-600 bg-gray-100 rounded-full py-1">
              OU DEFINIR MANUALMENTE
            </span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          
          {/* CEP Search */}
          <div>
            <Label htmlFor="cep" className="text-sm font-medium">📍 Buscar por CEP (Brasil)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="cep"
                placeholder="Digite seu CEP (ex: 01310-100)"
                value={cep}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCep(e.target.value)}
                maxLength={9}
                className="flex-1"
              />
              <Button onClick={handleCepSearch} disabled={loading} variant="outline">
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formato: 12345-678 ou 12345678
            </p>
          </div>

          {/* City Search */}
          <div>
            <Label htmlFor="city" className="text-sm font-medium">🏙️ Buscar por Nome da Cidade</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="city"
                placeholder="Digite sua cidade (ex: São Paulo, Rio de Janeiro)"
                value={cityName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCityName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCitySearch} disabled={loading} variant="outline">
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Digite o nome da sua cidade em português
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsModalOpen(false)
                setError('')
                setCep('')
                setCityName('')
              }}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}