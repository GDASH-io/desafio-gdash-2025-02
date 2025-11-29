import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Mail, Lock, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { authService } from '../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="bg-gray-700 rounded-3xl p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-4">
            <Sun className="w-10 h-10 text-gray-800" />
          </div>
          <h1 className="text-3xl font-bold text-white">Weather Dashboard</h1>
          <p className="text-gray-400 mt-2">GDASH Challenge 2025</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-700 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Faça login para continuar</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="text-red-400">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Lock className="w-4 h-4" />
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">Dica:</span> Use as credenciais padrão
            </p>
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
              <span>Email: admin@example.com</span>
              <span>•</span>
              <span>Senha: 123456</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Penápolis, SP • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
