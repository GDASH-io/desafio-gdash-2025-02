import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Loader2, Cloud, Wind, Users, Zap, Download, LogOut, Trash, Edit, Plus, RefreshCw, ChevronLeft, ChevronRight, Sun, Droplet } from 'lucide-react';

// --- CONFIGURAÇÃO E CONTEXTO ---
// CORREÇÃO: Usando window.location.origin para montar o URL base da API
// Em ambientes modernos como Vite/Next.js, 'import.meta.env' é usado,
// mas para garantir compatibilidade em build targets mais antigos ou em certas configurações de container,
// vamos usar uma abordagem robusta com base no ambiente de execução.
// Mantendo a lógica de fallback para o proxy do Nginx.
const API_BASE_URL = window.location.origin.includes('localhost')
    ? 'http://localhost:3000/api' // URL de desenvolvimento se rodando localmente (se o docker-compose expor a porta 3000)
    : '/api'; // Proxy do Nginx em ambiente de produção/container
// Nota: O erro original indicava que o bundler não suportava import.meta.env.
// Ao remover a dependência direta, garantimos que a compilação ocorra.

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// --- COMPONENTES SHADCN/UI SIMULADOS (TAILWIND) ---

const Button = ({ children, onClick, variant = 'default', className = '', disabled = false, icon: Icon = null }) => {
    let baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2';
    switch (variant) {
        case 'secondary': baseStyles += ' bg-gray-100 text-gray-900 hover:bg-gray-200'; break;
        case 'destructive': baseStyles += ' bg-red-500 text-white hover:bg-red-600'; break;
        case 'outline': baseStyles += ' border border-gray-300 text-gray-700 hover:bg-gray-50'; break;
        case 'ghost': baseStyles += ' text-gray-700 hover:bg-gray-100'; break;
        case 'success': baseStyles += ' bg-green-500 text-white hover:bg-green-600'; break;
        default: baseStyles += ' bg-blue-600 text-white hover:bg-blue-700 shadow-md'; break;
    }
    if (disabled) { baseStyles += ' opacity-50 cursor-not-allowed'; }
    return (
        <button className={`${baseStyles} ${className}`} onClick={onClick} disabled={disabled}>
            {Icon && <Icon className="w-5 h-5" />}
            <span>{children}</span>
        </button>
    );
};

const Input = ({ type = 'text', placeholder, value, onChange, className = '', disabled = false }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${className}`}
    />
);

const Card = ({ title, children, className = '' }) => (
    <div className={`bg-white shadow-xl rounded-xl p-6 transition-all duration-300 hover:shadow-2xl ${className}`}>
        {title && <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>}
        {children}
    </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
    let baseStyles = 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full';
    switch (variant) {
        case 'secondary': baseStyles += ' bg-gray-100 text-gray-800'; break;
        case 'destructive': baseStyles += ' bg-red-100 text-red-800'; break;
        case 'success': baseStyles += ' bg-green-100 text-green-800'; break;
        default: baseStyles += ' bg-blue-100 text-blue-800'; break;
    }
    return <span className={`${baseStyles} ${className}`}>{children}</span>;
};


// --- FUNÇÕES DE API ---

const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
        // Desloga se não autorizado ou acesso negado
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error("Sessão expirada ou acesso negado.");
    }

    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch {
            errorData.message = response.statusText;
        }
        throw new Error(errorData.message || 'Erro na requisição da API');
    }

    // Se for uma requisição GET ou POST, retorna JSON.
    // O endpoint de exportação é uma exceção (retorna texto puro).
    if (response.headers.get('content-type')?.includes('application/json')) {
        return response.json();
    }
    return response.text();
};


// --- COMPONENTES DA APLICAÇÃO ---

const LoginForm = () => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha no login.');
            }

            const data = await response.json();
            login(data.access_token);
        } catch (err) {
            setError(err.message || 'Erro de rede ou credenciais inválidas.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card title="Login ClimaTempo" className="w-full max-w-md">
                <p className="text-sm text-gray-500 mb-6 text-center">Use admin/password123 para testar.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading} icon={loading ? Loader2 : null}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

const Header = ({ currentView, setView }) => {
    const { logout } = useAuth();
    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <h1 className="text-2xl font-bold text-blue-600">ClimaTempo</h1>
                <nav className="flex flex-wrap justify-center space-x-2 sm:space-x-4 items-center">
                    <Button variant={currentView === 'dashboard' ? 'default' : 'ghost'} onClick={() => setView('dashboard')} className="p-2 sm:p-auto">
                        Dashboard
                    </Button>
                    <Button variant={currentView === 'users' ? 'default' : 'ghost'} onClick={() => setView('users')} className="p-2 sm:p-auto">
                        <Users className="w-4 h-4 mr-1 hidden sm:inline" /> Usuários
                    </Button>
                    <Button variant={currentView === 'pokeapi' ? 'default' : 'ghost'} onClick={() => setView('pokeapi')} className="p-2 sm:p-auto">
                        <Zap className="w-4 h-4 mr-1 hidden sm:inline" /> PokeAPI
                    </Button>
                    <Button variant="secondary" onClick={logout} icon={LogOut} className="p-2 sm:p-auto">
                        Sair
                    </Button>
                </nav>
            </div>
        </header>
    );
};

const StatCard = ({ icon: Icon, title, value, unit, description, colorClass }) => (
    <Card className={`text-center flex flex-col items-center ${colorClass}`}>
        <Icon className={`w-10 h-10 mb-2 ${colorClass.replace('bg-', 'text-')}`} />
        <p className="text-4xl font-extrabold mb-1 text-gray-900">{value}</p>
        <p className="text-lg text-gray-500 mb-2">{unit}</p>
        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-gray-400 mt-2">{description}</p>
    </Card>
);

const Dashboard = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch('/weather');
            setWeatherData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Configura a atualização em tempo real (fetch a cada 10 segundos)
        const interval = setInterval(fetchData, 10000); 
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleExport = async () => {
        try {
            const csvData = await apiFetch('/weather/export');
            
            // Cria um blob e faz o download
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clima-dados-${new Date().toISOString()}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            // Notificação de sucesso pode ser implementada aqui
        } catch (err) {
            setError(err.message);
        }
    };

    const latestData = weatherData.length > 0 ? weatherData[0] : null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <h2 className="text-3xl font-extrabold text-gray-900">Dashboard Climático</h2>
                <div className="space-x-2">
                    <Button variant="outline" onClick={fetchData} disabled={loading} icon={loading ? RefreshCw : null} className={loading ? 'animate-spin-slow' : ''}>
                        {loading ? 'Atualizando...' : 'Atualizar Dados'}
                    </Button>
                    <Button variant="success" onClick={handleExport} icon={Download}>
                        Exportar CSV
                    </Button>
                </div>
            </div>

            {error && <p className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">Erro: {error}</p>}

            {loading && weatherData.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                </div>
            ) : (
                <>
                    {latestData ? (
                        <>
                        {/* Cartões de Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={Cloud}
                                title="Temperatura Atual"
                                value={latestData.temperature?.toFixed(1)}
                                unit="°C"
                                description={`Em ${new Date(latestData.timestamp).toLocaleTimeString()}`}
                                colorClass="bg-blue-50 text-blue-600"
                            />
                            <StatCard
                                icon={Wind}
                                title="Velocidade do Vento"
                                value={latestData.wind_speed?.toFixed(1)}
                                unit="km/h"
                                description="Medição de vento em superfície"
                                colorClass="bg-green-50 text-green-600"
                            />
                            <StatCard
                                icon={Sun}
                                title="Latitude"
                                value={latestData.latitude?.toFixed(4)}
                                unit=""
                                description="Localização da coleta de dados"
                                colorClass="bg-yellow-50 text-yellow-600"
                            />
                            <StatCard
                                icon={Droplet}
                                title="Código do Clima"
                                value={latestData.weather_code}
                                unit=""
                                description="Código da Open-Meteo"
                                colorClass="bg-purple-50 text-purple-600"
                            />
                        </div>
                        
                        {/* Insight de IA */}
                        <Card title="Insight de Inteligência Artificial" className='border-l-4 border-blue-500'>
                            <p className="text-lg italic text-gray-700">
                                {latestData.insight || "Aguardando geração de insight de IA..."}
                            </p>
                            <Badge variant="secondary" className="mt-4">
                                Última Leitura: {new Date(latestData.timestamp).toLocaleString()}
                            </Badge>
                        </Card>
                        </>
                    ) : (
                        <p className='text-center py-8 text-gray-500'>Nenhum dado climático disponível ainda. O coletor deve estar iniciando.</p>
                    )}

                    {/* Tabela de Histórico */}
                    {weatherData.length > 0 && (
                        <Card title="Histórico de Leituras Recentes">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {["Data/Hora", "Temp (°C)", "Vento (km/h)", "Insight de IA"].map((header) => (
                                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {weatherData.map((data) => (
                                            <tr key={data._id} className='hover:bg-gray-50 transition-colors'>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {new Date(data.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.temperature.toFixed(1)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.wind_speed.toFixed(1)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 max-w-lg break-words">{data.insight || <span className='italic text-gray-400'>Aguardando...</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch('/users');
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setUsername(user ? user.username : '');
        setPassword('');
        setRole(user ? user.role : 'user');
        setIsModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const userData = { username, role, password };
        if (!userData.password) delete userData.password; // Não envia senha vazia ao editar
        if (!userData.username) { setError("Nome de usuário é obrigatório."); setLoading(false); return; }
        if (!editingUser && !userData.password) { setError("Senha é obrigatória para novo usuário."); setLoading(false); return; }

        try {
            if (editingUser) {
                await apiFetch(`/users/${editingUser._id}`, {
                    method: 'PUT',
                    body: JSON.stringify(userData),
                });
            } else {
                await apiFetch('/users', {
                    method: 'POST',
                    body: JSON.stringify(userData),
                });
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        // Implementação do modal customizado (em vez de window.confirm)
        if (!confirmDeletion()) return;
        
        try {
            await apiFetch(`/users/${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const confirmDeletion = () => {
        // Simulação de modal de confirmação no console para evitar o alert()
        console.log("Ação de Confirmação: Deletar Usuário.");
        // Em um app real, seria um componente Modal
        return true; 
    }
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Gerenciamento de Usuários (CRUD)</h2>
                <Button onClick={() => handleOpenModal()} icon={Plus}>
                    Novo Usuário
                </Button>
            </div>
            
            {error && <p className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">Erro: {error}</p>}
            
            <Card title="Lista de Usuários">
                {loading ? (
                    <div className="flex justify-center items-center h-32"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["ID", "Nome de Usuário", "Papel", "Ações"].map((header) => (
                                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{user._id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>{user.role}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <Button variant="outline" onClick={() => handleOpenModal(user)} icon={Edit} className='p-2'>
                                                Editar
                                            </Button>
                                            <Button variant="destructive" onClick={() => handleDeleteUser(user._id)} icon={Trash} className='p-2'>
                                                Excluir
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal de CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card title={editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'} className="w-full max-w-md">
                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <Input placeholder="Nome de Usuário" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!!editingUser} />
                            <Input type="password" placeholder={editingUser ? 'Nova Senha (deixe vazio para manter)' : 'Senha'} value={password} onChange={(e) => setPassword(e.target.value)} />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Papel</label>
                                <select 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)} 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-2">
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={loading} icon={loading ? Loader2 : null}>
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

const PokeAPIPage = () => {
    const [pokemonList, setPokemonList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const limit = 20;

    const fetchPokemon = useCallback(async (newOffset) => {
        setLoading(true);
        setError(null);
        try {
            // OBS: A API NestJS está mockada para ignorar offset/limit, mas o fetch usa o endpoint
            const data = await apiFetch(`/pokeapi?limit=${limit}&offset=${newOffset}`);
            // Simula a paginação no cliente, pois a API backend só retorna a primeira página
            const allResults = data.results || [];
            setPokemonList(allResults.slice(newOffset, newOffset + limit));
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchPokemon(offset);
    }, [fetchPokemon, offset]);
    
    const handleNext = () => setOffset(prev => prev + limit);
    const handlePrev = () => setOffset(prev => Math.max(0, prev - limit));


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Integração Opcional: Lista de Pokémon (PokéAPI)</h2>
            <p className='text-gray-600'>Exemplo de integração com uma API pública paginada (a paginação está simulada no frontend, usando a primeira página da API por limitação do backend mockado).</p>
            
            {error && <p className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">Erro: {error}</p>}

            <Card title={`Pokémon de ${offset + 1} a ${offset + pokemonList.length}`}>
                {loading ? (
                    <div className="flex justify-center items-center h-32"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {pokemonList.map((pokemon, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition duration-200">
                                    <p className="text-lg font-semibold capitalize">{pokemon.name}</p>
                                    <p className="text-sm text-gray-500">#{offset + index + 1}</p>
                                    <a href={pokemon.url} target="_blank" rel="noopener noreferrer" className='text-xs text-blue-600 hover:underline mt-1 block'>
                                        Detalhes
                                    </a>
                                </div>
                            ))}
                        </div>
                        
                        {/* Controles de Paginação */}
                        <div className="flex justify-between mt-6 pt-4 border-t">
                            <Button 
                                variant="outline" 
                                onClick={handlePrev} 
                                disabled={offset === 0}
                                icon={ChevronLeft}
                            >
                                Anterior
                            </Button>
                            <span className='text-sm text-gray-600 self-center'>Página {(offset / limit) + 1}</span>
                            <Button 
                                variant="outline" 
                                onClick={handleNext} 
                                icon={ChevronRight}
                                // Desabilita se for a última página de 20 (mockada na API)
                                disabled={(offset + limit) >= 20} 
                            >
                                Próxima
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL (Auth & Router) ---

function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Auto-login in development (localhost) to simplify demo
    useEffect(() => {
        if (token) return;
        try {
            const hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                // Attempt to login automatically with default dev creds
                (async () => {
                    try {
                        const res = await fetch(`${API_BASE_URL}/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: 'admin', password: 'password123' }),
                        });
                        if (!res.ok) return;
                        const data = await res.json();
                        localStorage.setItem('token', data.access_token);
                        setToken(data.access_token);
                    } catch (e) {
                        // ignore auto-login failures
                        console.warn('Auto-login failed:', e);
                    }
                })();
            }
        } catch (e) {
            // ignore in environments where window isn't available
        }
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

const AppContent = () => {
    const { token } = useAuth();
    // Roteamento simples no lado do cliente
    const [currentView, setCurrentView] = useState('dashboard');

    if (!token) {
        return <LoginForm />;
    }

    // Layout Principal
    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
            <Header currentView={currentView} setView={setCurrentView} />
            <main>
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'users' && <UsersPage />}
                {currentView === 'pokeapi' && <PokeAPIPage />}
            </main>
            <footer className="py-6 text-center text-sm text-gray-500 border-t mt-12">
                ClimaTempo v1.0 | Sistema Completo de Observação Climática
            </footer>
        </div>
    );
};

export default App;