import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Weather from './pages/Weather'
import Realtime from './pages/Realtime'
import About from './pages/About'
import Architecture from './pages/Architecture'
import UserManagement from './pages/UserManagement'
import RickAndMortyReference from './pages/RickAndMortyReference'
import NotFound from './pages/NotFound'
import { ProtectedRoute } from './components/ProtectedRoute'

const queryClient = new QueryClient()

const Layout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center px-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
          Climate Sync © 2025 — Desenvolvido com React + NestJS
        </footer>
      </div>
    </div>
  </SidebarProvider>
)

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
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/weather',
      element: (
        <ProtectedRoute>
          <Layout>
            <Weather />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/realtime',
      element: (
        <ProtectedRoute>
          <Layout>
            <Realtime />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/about',
      element: (
        <ProtectedRoute>
          <Layout>
            <About />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/architecture',
      element: (
        <ProtectedRoute>
          <Layout>
            <Architecture />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/users',
      element: (
        <ProtectedRoute>
          <Layout>
            <UserManagement />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/rick-and-morty',
      element: (
        <ProtectedRoute>
          <Layout>
            <RickAndMortyReference />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: '*',
      element: <NotFound />,
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
