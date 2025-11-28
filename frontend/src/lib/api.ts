import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_BASE
});

export const authHeaders = (token?: string) => (token ? { Authorization: `Bearer ${token}` } : {});

export const downloadExport = async (token: string, type: 'csv' | 'xlsx') => {
    const response = await api.get(`/weather/export/${type}`, {
        headers: authHeaders(token),
        responseType: 'blob'
    });
    const mime = type === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const blob = new Blob([response.data], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-logs.${type}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};