// src/hooks/useRealtimeWeather.ts
import { useState, useEffect, useRef } from 'react'
import { REALTIME_WEATHER_URL, type WeatherData } from '@/services/api'

export const useRealtimeWeather = () => {
  const [latestData, setLatestData] = useState<WeatherData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    // Não conecta se não houver token
    if (!token) {
      console.warn('⚠️ Token não encontrado. Conexão SSE não estabelecida.')
      setIsConnected(false)
      setError('Token não encontrado')
      return
    }

    const connectSSE = () => {
      try {
        // Adiciona o token como query parameter

        const urlWithToken = `${REALTIME_WEATHER_URL}?token=${encodeURIComponent(token)}`
        
        const eventSource = new EventSource(urlWithToken)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          setIsConnected(true)
          setError(null)
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setLatestData(data)
          } catch (parseError) {
            console.error('❌ Erro ao analisar dados SSE:', parseError)
            setError('Erro ao processar dados')
          }
        }

        eventSource.onerror = (event) => {
          console.error('❌ Erro na conexão SSE:', event)
          setIsConnected(false)
          
          // Verifica o estado da conexão
          if (eventSource.readyState === EventSource.CLOSED) {
            console.warn('⚠️ Conexão SSE fechada')
            setError('Conexão fechada. Verifique sua autenticação.')
            
            // Limpa a conexão antiga
            eventSource.close()
            
            // Tenta reconectar após 5 segundos
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Tentando reconectar...')
              connectSSE()
            }, 5000)
          } else if (eventSource.readyState === EventSource.CONNECTING) {
            console.log('🔄 Conectando...')
            setError('Conectando...')
          }
        }
      } catch (error) {
        console.error('❌ Erro ao criar EventSource:', error)
        setIsConnected(false)
        setError(error instanceof Error ? error.message : 'Erro desconhecido')
      }
    }

    // Inicia a primeira conexão
    connectSSE()
   
    return () => {
     
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, []) 

  return { 
    latestData, 
    isConnected,
    error 
  }
}