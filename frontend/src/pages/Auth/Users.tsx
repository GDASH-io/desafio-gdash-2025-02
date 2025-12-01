import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import usersService from "@/services/usersService";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";


function Users() {
    const [users, setUsers] = useState<Array<{ id: string; email: string; role: string }>>([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; role: string } | undefined>();

    const fetchUsers = async () => {
        try {
            const data = await usersService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Modal logic movido para componente CreateUserDialog

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Usuários</h1>
                    <p className="text-sm text-gray-500">Gerenciamento de usuários</p>
                </div>
                <div className="h-px w-full bg-gray-200" />

                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle>Lista de Usuários</CardTitle>
                        <div>
                            <Button onClick={() => setCreateOpen(true)}>Adicionar Usuário</Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left">E-mail</th>
                                        <th className="px-3 py-2 text-left">Tipo</th>
                                        <th className="px-3 py-2 text-left">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b">
                                            <td className="px-3 py-2">{user.email}</td>
                                            <td className="px-3 py-2">{user.role}</td>
                                            <td className="px-3 py-2 space-x-2">
                                                <Button variant="link" size="sm" onClick={() => { setSelectedUser(user); setEditOpen(true); }}>Editar</Button>
                                                
                                                <Button variant="link" size="sm" className="text-red-600"
                                                onClick={async () => {
                                                    const confirmed = window.confirm(`Excluir usuário ${user.email}?`);
                                                    if (!confirmed) return;
                                                    try {                                   
                                                        await usersService.delete(user.id);
                                                        await fetchUsers();
                                                    } catch (e) {
                                                        console.error('Erro ao excluir usuário', e);
                                                    }
                                               }}>Excluir</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-3 py-6 text-center text-gray-500">Nenhum usuário cadastrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchUsers} />
                <EditUserDialog open={editOpen} onOpenChange={(o) => { if(!o) setSelectedUser(undefined); setEditOpen(o); }} user={selectedUser as any} onUpdated={fetchUsers} />
            </div>
        </Layout>
    );
}

export default Users;