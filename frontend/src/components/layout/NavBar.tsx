import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '../ui/dropdown-menu';

interface NavBarProps {
    current: 'home' | 'settings' | 'explorer' | 'users';
    onChange: (tab: 'home' | 'settings' | 'explorer' | 'users') => void;
    onLogout?: () => void;
}

export function NavBar({ current, onChange, onLogout }: NavBarProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm uppercase tracking-[0.4em] theme-muted">GDASH</p>
                <p className="text-lg font-semibold theme-text">Painel Climático</p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" aria-label="Abrir menu">
                        <Menu className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel>Navegação</DropdownMenuLabel>
                    <DropdownMenuItem
                        onSelect={() => onChange('home')}
                        className={current === 'home' ? 'bg-[var(--table-row-hover)]' : ''}
                    >
                        Home
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => onChange('explorer')}
                        className={current === 'explorer' ? 'bg-[var(--table-row-hover)]' : ''}
                    >
                        Explorar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => onChange('users')}
                        className={current === 'users' ? 'bg-[var(--table-row-hover)]' : ''}
                    >
                        Usuários
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => onChange('settings')}
                        className={current === 'settings' ? 'bg-[var(--table-row-hover)]' : ''}
                    >
                        Configurações
                    </DropdownMenuItem>
                    {onLogout && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={onLogout}>Sair</DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
