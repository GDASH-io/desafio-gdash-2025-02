import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, authAPI, LoginRequest } from '@/core/api'
import { setToStorage, removeFromStorage } from '@/lib/utils'

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (credentials: LoginRequest) => Promise<void>
    logout: () => void
    setUser: (user: User) => void
    clearError: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials: LoginRequest) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await authAPI.login(credentials)
                    console.log('Login response:', response)

                    const token = response.tokens?.accessToken || null
                    const user = response.user || null

                    console.log('Extracted:', { token: !!token, user: !!user })

                    if (token) {
                        setToStorage('token', token)
                    }
                    if (user) {
                        setToStorage('user', user)
                    }

                    const newState = {
                        user,
                        token,
                        isAuthenticated: !!token && !!user,
                        isLoading: false,
                    }

                    console.log('Setting state:', newState)
                    set(newState)

                    // Verifica o estado após set
                    setTimeout(() => {
                        const currentState = get()
                        console.log('Current state after set:', {
                            isAuthenticated: currentState.isAuthenticated,
                            hasUser: !!currentState.user,
                            hasToken: !!currentState.token
                        })
                    }, 50)

                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Login failed'
                    set({ error: errorMessage, isLoading: false })
                    throw error
                }
            },

            logout: () => {
                removeFromStorage('token')
                removeFromStorage('user')
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                })
            },

            setUser: (user: User) => {
                set({ user, isAuthenticated: !!user && !!get().token })
            },

            clearError: () => {
                set({ error: null })
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
