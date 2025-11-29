import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    email: string;
}

interface AuthContextType {
    token: string | null;
    userEmail: string | null;
    isAdmin: boolean;
    isLoggedIn: boolean;
    handleLogin: (newToken: string) => void;
    handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("gdash_token"));

    const userEmail = useMemo(() => {
        if (!token) return null;
        try {
            return jwtDecode<JwtPayload>(token).email;
        } catch (e) {
            console.error("Token inválido.", e);
            localStorage.removeItem("gdash_token");
            return null;
        }
    }, [token]);

    const isAdmin = userEmail === 'gdash@gdash.com';
    const isLoggedIn = !!token && !!userEmail;

    const handleLogin = useCallback((newToken: string) => {
        localStorage.setItem("gdash_token", newToken);
        setToken(newToken);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("gdash_token");
        setToken(null);
    }, []);

    const value = useMemo(() => ({
        token, userEmail, isAdmin, isLoggedIn, handleLogin, handleLogout
    }), [token, userEmail, isAdmin, isLoggedIn, handleLogin, handleLogout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};