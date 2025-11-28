import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toast';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <App />
                <Toaster />
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>
);