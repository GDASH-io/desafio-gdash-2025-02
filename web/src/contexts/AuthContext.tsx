import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../services/api'

// Constantes
const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const AUTH_HEADER = 'Authorization'

interface User {
  id: string
  email: string
  name: string
  role?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY)
        const userData = localStorage.getItem(USER_KEY)
        
        if (token) {
          // parse user storage or decode token to ensure we have role information
          let user: any = null
          if (userData) {
            try {
              user = JSON.parse(userData)
            } catch (_) {
              // ignore - we'll try decode below
            }
          }

          // if stored user doesn't contain role, decode JWT and populate role
          if (!user || !user.role) {
            try {
              const [, payload] = token.split('.')
              const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
              user = { ...(user || {}), role: decoded.role }
            } catch (err) {
              // decoding failed — keep whatever user data we have
            }
          }

          if (user) {
            setUser(user)
          }

          api.defaults.headers.common[AUTH_HEADER] = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Limpar dados corrompidos
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { access_token, user } = response.data
      
      // write both current and legacy keys so the API client picks up the right token
      localStorage.setItem(TOKEN_KEY, access_token)
      localStorage.setItem('authToken', access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      
      api.defaults.headers.common[AUTH_HEADER] = `Bearer ${access_token}`
      setUser(user)
    } catch (error) {
      throw new Error('Credenciais inválidas')
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete api.defaults.headers.common[AUTH_HEADER]
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}