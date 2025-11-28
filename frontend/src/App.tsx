import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { Explorer } from './pages/Explorer';
import { UsersPage } from './pages/UsersPage';
import { NavBar } from './components/layout/NavBar';
import { PageHeader } from './components/layout/PageHeader';
import { Login } from './pages/Login';
import { useAuth } from './context/AuthContext';
import { useDashboard } from './hooks/useDashboard';
import { useToast } from './components/ui/toast';
import { useTheme } from './context/ThemeContext';

function App() {
    const { token, email, logout } = useAuth();
    const {
        logs,
        insights,
        insightsLoading,
        locations,
        collectConfig,
        loading,
        status,
        error,
        fetchAll,
        generateAiInsights,
        addLocation,
        deleteLocation,
        changeInterval,
        changePassword,
        exportData,
        setStatus,
        setError,
        cityFilter,
        setCityFilter,
        insightCity,
        setInsightCity,
        insightLogs,
        cities,
        logPagination,
        locationPagination,
        goToLogPage,
        goToLocationPage
    } = useDashboard(token);
    const [view, setView] = useState<'home' | 'settings' | 'explorer' | 'users'>('home');
    const { notify } = useToast();
    const { mode, setMode } = useTheme();

    useEffect(() => {
        if (status) {
            notify(status, 'success', 'refresh');
            setStatus('');
        }
    }, [status, notify, setStatus]);

    useEffect(() => {
        if (error) {
            notify(error, 'error');
            setError('');
        }
    }, [error, notify, setError]);

    if (!token) {
        return <Login />;
    }

    return (
        <div className="min-h-screen theme-bg px-4 py-4">
            <div className="mx-auto max-w-[1200px] space-y-6">
                <NavBar current={view} onChange={setView} onLogout={logout} />
                <PageHeader
                    title={
                        view === 'home'
                            ? 'Painel'
                            : view === 'explorer'
                            ? 'Explorar'
                            : view === 'users'
                            ? 'Usuários'
                            : 'Configurações'
                    }
                    description={
                        view === 'home'
                            ? 'Confira os registros mais recentes das suas cidades favoritas!'
                            : view === 'explorer'
                            ? 'Consuma uma API pública paginada por meio do backend.'
                            : view === 'users'
                            ? 'Gerencie os acessos da equipe.'
                            : 'Perfil, senha e intervalo global de coleta de dados.'
                    }
                />

                {view === 'home' ? (
                    <Home
                        logs={logs}
                        logPage={logPagination.page}
                        logTotalPages={logPagination.totalPages}
                        cities={cities}
                        cityFilter={cityFilter}
                        setCityFilter={setCityFilter}
                        insightCity={insightCity}
                        setInsightCity={setInsightCity}
                        insightLogs={insightLogs}
                        insights={insights}
                        insightsLoading={insightsLoading}
                        onGenerateInsights={generateAiInsights}
                        locations={locations}
                        locationPage={locationPagination.page}
                        locationTotalPages={locationPagination.totalPages}
                        loading={loading}
                        onRefresh={fetchAll}
                        onExport={exportData}
                        onAddLocation={addLocation}
                        onDeleteLocation={deleteLocation}
                        onLogPageChange={(direction) => {
                            const nextPage = direction === 'next' ? logPagination.page + 1 : logPagination.page - 1;
                            goToLogPage(nextPage);
                        }}
                        onLocationPageChange={(direction) => {
                            const nextPage =
                                direction === 'next' ? locationPagination.page + 1 : locationPagination.page - 1;
                            goToLocationPage(nextPage);
                        }}
                    />
                ) : view === 'explorer' ? (
                    <Explorer />
                ) : view === 'users' ? (
                    <UsersPage token={token} />
                ) : (
                    <Settings
                        email={email ?? 'Usuário'}
                        onChangePassword={changePassword}
                        collectInterval={collectConfig.collectIntervalMinutes}
                        onIntervalChange={changeInterval}
                        themeMode={mode}
                        onThemeChange={setMode}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
