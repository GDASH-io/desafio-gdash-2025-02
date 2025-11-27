import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Outlet } from 'react-router-dom'

export const Layout = () => {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-6">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
