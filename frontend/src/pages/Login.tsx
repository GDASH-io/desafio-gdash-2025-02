import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log("DEBUG_PORT_CHECK", "http://localhost:3001/api/auth/login");
            const response = await axios.post('http://localhost:3001/api/auth/login', {
                email,
                password,
            });
            login(response.data.access_token, response.data.user);
            navigate('/');
        } catch (err) {
            console.error("Login error:", err);
            setError('Credenciais inválidas');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
            <div className="glass-card p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-xl bg-white/60 border border-white/40">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gradient mb-2">Bem-vindo de Volta</h1>
                    <p className="text-gray-500">Faça login para acessar seu painel de clima</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">Endereço de E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="Digite seu e-mail"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="Digite sua senha"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30"
                    >
                        Entrar
                    </button>
                </form>
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Credenciais de Demonstração</p>
                    <div className="inline-block px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-500 font-mono">
                        admin@example.com / adminpassword
                    </div>
                </div>
            </div>
        </div>
    );
}
