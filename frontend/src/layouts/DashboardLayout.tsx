import { useAuth } from "@/context/AuthContext";
import { useWeather } from "@/hooks/useWeather";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, RefreshCw, Download } from "lucide-react";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const { isAdmin, handleLogout } = useAuth();
    const { loading, refresh, downloadCsv } = useWeather();
    
    const isDashboard = location.pathname.includes('/dashboard');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-10">
                
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                        <h1 
                            className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent cursor-pointer" 
                            onClick={() => navigate('/dashboard')} 
                        >
                            Monitor Climático - Mariana/MG
                        </h1>
                        <nav className="hidden md:flex gap-2">
                            <Button 
                                variant={isDashboard ? 'secondary' : 'ghost'} 
                                size="sm" 
                                onClick={() => navigate('/dashboard')} 
                                className={isDashboard ? 'bg-slate-800 text-white' : 'hover:bg-slate-700/50 hover:text-white text-slate-400'}>
                                <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                            </Button>
                            
                            {isAdmin && (
                                <Button 
                                    variant={!isDashboard ? 'secondary' : 'ghost'} 
                                    size="sm" 
                                    onClick={() => navigate('/users')} 
                                    className={!isDashboard ? 'bg-slate-800 text-white' : 'hover:bg-slate-700/50 hover:text-white text-slate-400'}>
                                    <Users className="h-4 w-4 mr-2" /> Usuários
                                </Button>
                            )}
                        </nav>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        {isDashboard && (
                            <>
                                <Button onClick={downloadCsv} variant="outline" className="flex-1 md:flex-none border-emerald-700/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 hover:text-white group">
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button onClick={refresh} disabled={loading} variant="outline" className="border-slate-700 bg-slate-900/50 text-slate-200">
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </>
                        )}
                        <Button onClick={handleLogout} variant="destructive" className="bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40">
                            <LogOut className="h-4 w-4" /> Sair
                        </Button>
                    </div>
                </header>

                <Outlet />

            </div>
        </div>
    );
}