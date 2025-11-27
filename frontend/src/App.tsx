import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { ExplorePage } from '@/pages/ExplorePage'
import { useThemeStore } from '@/stores/theme.store'
import { useEffect } from 'react'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

function App() {
    const { isDark, setTheme } = useThemeStore()

    useEffect(() => {
        // Apply theme on mount
        setTheme(isDark)
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/users" element={<UsersPage />} />
                            <Route path="/explorar" element={<ExplorePage />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Route>
                </Routes>
                <Toaster />
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App
