import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UserPlus } from "lucide-react";

export function GestaoUsuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [novoNome, setNovoNome] = useState("");
    const [novoEmail, setNovoEmail] = useState("");
    const [novaSenha, setNovaSenha] = useState("");

    const carregarUsuarios = async () => {
        const res = await fetch("http://localhost:3000/users");
        const json = await res.json();
        setUsuarios(json);
    };

    const criarUsuario = async () => {
        if (!novoEmail || !novaSenha) return;
        await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: novoNome, email: novoEmail, senha: novaSenha })
        });
        setNovoNome(""); setNovoEmail(""); setNovaSenha("");
        carregarUsuarios();
    };

    const deletarUsuario = async (id: string) => {
        if (confirm("Tem certeza?")) {
            await fetch(`http://localhost:3000/users/${id}`, { method: "DELETE" });
            carregarUsuarios();
        }
    };

    useEffect(() => { carregarUsuarios(); }, []);

    return (
        <Card className="mt-8 border-none shadow-lg bg-white/95">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-700">
                    <UserPlus className="h-5 w-5" /> Gestão de Usuários
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-6">
                    <Input placeholder="Nome" value={novoNome} onChange={e => setNovoNome(e.target.value)} />
                    <Input placeholder="Email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} />
                    <Input placeholder="Senha" type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
                    <Button
                        className="w-full h-11 bg-green-500 hover:bg-green-900 text-white font-bold transition-all"
                        onClick={criarUsuario}
                    >Adicionar</Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usuarios.map(u => (
                            <TableRow key={u._id}>
                                <TableCell>{u.nome}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                    <Button variant="destructive" size="sm"
                                        className="text-red-500 hover:text-red-950"
                                        onClick={() => deletarUsuario(u._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}