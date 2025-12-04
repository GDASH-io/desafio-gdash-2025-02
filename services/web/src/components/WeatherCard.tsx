import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface WeatherCardProps {
    title: string;
    value: number | string | undefined;
    unit: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
} 

export const WeatherCard = ({ title, value, unit, icon: Icon, trend, className }: WeatherCardProps) => {
    const displayValue = value !== undefined ? value : '---';
    
    const trendColors = {
        up: 'text-red-500',
        down: 'text-blue-500',
        neutral: 'text-brand-900',
    };

    return (
        <Card className={`hover:shadow-lg transition-shadow border-l-4 border-l-brand-500 ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">{title}</CardTitle>\
                <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-brand-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline space-x-2">
                    <div className="text-3xl font-bold text-black">
                        {typeof displayValue === 'number' ? displayValue.toFixed(1) : displayValue}
                    </div>
                    <span className="text-lg text-gray-900">{unit}</span>
                </div>
                {trend && (
                    <p className={`text-xs mt-2 ${trendColors[trend] || trendColors.neutral}`}>
                        {trend === 'up' && 'Acima da média'}
                        {trend === 'down' && 'Abaixo da média'}
                        {trend === 'neutral' && 'Dentro da média'}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};