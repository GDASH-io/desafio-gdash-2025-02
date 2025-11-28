import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    applied: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('gdash_theme') as ThemeMode | null;
        return saved ?? 'system';
    });

    const applied = useMemo(() => {
        if (mode === 'system') return getSystemTheme();
        return mode;
    }, [mode]);

    useEffect(() => {
        localStorage.setItem('gdash_theme', mode);
        document.documentElement.dataset.theme = applied;
    }, [mode, applied]);

    useEffect(() => {
        const listener = (e: MediaQueryListEvent) => {
            if (mode === 'system') {
                document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
            }
        };
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }, [mode]);

    const setMode = (value: ThemeMode) => setModeState(value);

    return <ThemeContext.Provider value={{ mode, setMode, applied }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
    return ctx;
}