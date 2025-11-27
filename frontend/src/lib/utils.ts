import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function getFromStorage<T>(key: string): T | null {
    try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
    } catch {
        return null
    }
}

export function setToStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error('Error saving to localStorage:', error)
    }
}

export function removeFromStorage(key: string): void {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.error('Error removing from localStorage:', error)
    }
}
