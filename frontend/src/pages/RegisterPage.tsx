import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateUser } from '@/hooks/useUsers'
import { Loader2, UserPlus } from 'lucide-react'

export const RegisterPage = () => {
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [funcao, setFuncao] = useState('')
    const [senha, setSenha] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()
    const { toast } = useToast()
    const createUser = useCreateUser()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nome || !email || !senha) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Preencha todos os campos obrigatórios',
            })
            return
        }
        setIsLoading(true)
        try {
            await createUser.mutateAsync({ nome, email, funcao, senha })
            toast({
                variant: 'success',
                title: 'Conta criada!',
                description: 'Você já pode fazer login.',
            })
            setTimeout(() => {
                navigate('/login')
            }, 1000)
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro ao registrar',
                description: error.response?.data?.message || 'Não foi possível criar a conta',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md sketch-card">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <UserPlus className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-hand">Criar Conta</CardTitle>
                    <CardDescription>
                        Preencha os dados para criar sua conta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                                id="nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                disabled={isLoading}
                                className="sketch-border"
                                placeholder="Seu nome completo"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="sketch-border"
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="funcao">Função (opcional)</Label>
                            <Input
                                id="funcao"
                                value={funcao}
                                onChange={(e) => setFuncao(e.target.value)}
                                disabled={isLoading}
                                className="sketch-border"
                                placeholder="Admin, Usuário, etc."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <Input
                                id="senha"
                                type="senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                disabled={isLoading}
                                className="sketch-border"
                                placeholder="••••••••"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                'Registrar'
                            )}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <button type='button' onClick={() => navigate('/login')}>Já tem conta? Entrar</button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
