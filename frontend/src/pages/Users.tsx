import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Users() {
    const [users, setUsers] = useState<any[]>([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', name: '' });
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Erro ao buscar usuários", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/users', newUser);
            setNewUser({ email: '', password: '', name: '' });
            fetchUsers();
        } catch (error) {
            alert('Erro ao criar usuário');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await axios.delete(`http://localhost:3001/api/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert('Erro ao excluir usuário');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                    <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">Voltar ao Dashboard</button>
                </div>

                {/* Create User Form */}
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-medium mb-4">Criar Novo Usuário</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input
                                type="text"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">E-mail</label>
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Senha</label>
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Criar</button>
                    </form>
                </div>

                {/* Users List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
