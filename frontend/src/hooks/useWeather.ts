import { useQuery, useMutation } from '@tanstack/react-query'
import { weatherAPI } from '@/services/api'

export const useWeatherData = () => {
    return useQuery({
        queryKey: ['weather'], // isso é a chave da query
        queryFn: weatherAPI.getAll, 
        refetchInterval: 300000,
    })
}

export const useWeatherChartData = () => {
    return useQuery({
        queryKey: ['weather-charts'],
        queryFn: weatherAPI.getChartData,
        refetchInterval: 60000,
    })
}

export const useWeatherInsights = () => {
    return useQuery({
        queryKey: ['weather-insights'],
        queryFn: weatherAPI.getInsights,
        refetchInterval: 60000,
    })
}

export const useExportCSV = () => {
    return useMutation({
        mutationFn: weatherAPI.exportCSV,
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `weather-data-${new Date().toISOString()}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        },
    })
}

export const useExportXLSX = () => {
    return useMutation({
        mutationFn: weatherAPI.exportXLSX,
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `weather-data-${new Date().toISOString()}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        },
    })
}
