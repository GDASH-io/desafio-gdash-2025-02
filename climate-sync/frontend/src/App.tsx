import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import Login from './pages/Login'

import Dashboard from './pages/Dashboard'
import WeatherTable from './pages/WeatherTable'
import RealtimePage from './pages/Realtime'
import UserManagement from './pages/UserManagement'
import About from './pages/About'
import Architecture from './pages/Architecture'
import RickAndMortyReference from './pages/RickAndMortyReference'
import NotFound from './pages/NotFound'
import { ThemeProvider } from './components/ThemeProvider'
import { ThemeToggle } from './components/ThemeToggle'

const queryClient = new QueryClient()

// Layout component para envolver as rotas com a estrutura comum
const Layout = ({ children }: { children: React.ReactNode }) => {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm font-medium text-muted-foreground">
                  Olá, {user.name}
                </span>
              )}
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
          <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
            Climate Sync © 2025 — Desenvolvido com Docker + React + NestJS + Go +
            Rabbitmq + Python
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}

// Configuração do router com future flags
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Login />,
    },

    {
      path: '/dashboard',
      element: (
        <Layout>
          <Dashboard />
        </Layout>
      ),
    },
    {
      path: '/weather',
      element: (
        <Layout>
          <WeatherTable />
        </Layout>
      ),
    },
    {
      path: '/realtime',
      element: (
        <Layout>
          <RealtimePage />
        </Layout>
      ),
    },
    {
      path: '/users',
      element: (
        <Layout>
          <UserManagement />
        </Layout>
      ),
    },
    {
      path: '/about',
      element: (
        <Layout>
          <About />
        </Layout>
      ),
    },
    {
      path: '/architecture',
      element: (
        <Layout>
          <Architecture />
        </Layout>
      ),
    },
    {
      path: '/rick-and-morty',
      element: (
        <Layout>
          <RickAndMortyReference />
        </Layout>
      ),
    },
    {
      path: '*',
      element: (
        <Layout>
          <NotFound />
        </Layout>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_concurrentFeatures: true,
    },
  }
)

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
