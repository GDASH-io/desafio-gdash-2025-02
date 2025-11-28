import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'gdash_token';

type AuthContextValue = {
    token: string | null;
    email: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const [email, setEmail] = useState<string | null>(() => localStorage.getItem('gdash_email'));

    useEffect(() => {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }, [token]);

    useEffect(() => {
        if (email) {
            localStorage.setItem('gdash_email', email);
        } else {
            localStorage.removeItem('gdash_email');
        }
    }, [email]);

    const login = async (userEmail: string, password: string) => {
        const response = await api.post('/auth/login', { email: userEmail, password });
        setToken(response.data.access_token);
        setEmail(userEmail);
    };

    const logout = () => {
        setToken(null);
        setEmail(null);
    };

    return <AuthContext.Provider value={{ token, email, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
    }
    return ctx;
}
