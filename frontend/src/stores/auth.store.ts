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
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials: LoginRequest) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await authAPI.login(credentials)
                    setToStorage('token', response.token)
                    setToStorage('user', response.user)
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    })
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
                set({ user })
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
