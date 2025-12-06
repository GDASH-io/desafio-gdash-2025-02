import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard = ({ title, value, icon: Icon, description, trend, trendUp, loading }: StatCardProps & { loading?: boolean }) => {
  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
            <div className="h-4 w-16 bg-slate-800 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {(description || trend) && (
              <p className="text-xs text-slate-500 mt-1">
                {trend && (
                  <span className={trendUp ? "text-green-500 mr-1" : "text-red-500 mr-1"}>
                    {trend}
                  </span>
                )}
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface InsightBannerProps {
  insight: string;
  averageTemp?: number;
  loading?: boolean;
}

export const InsightBanner = ({ insight, averageTemp, loading }: InsightBannerProps) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 border border-emerald-800/50 rounded-lg p-6 mb-8 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 bg-emerald-500/20 rounded-full" />
          <div className="space-y-2 w-full">
            <div className="h-6 w-32 bg-emerald-500/20 rounded" />
            <div className="h-4 w-full bg-emerald-500/10 rounded" />
            <div className="h-4 w-3/4 bg-emerald-500/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 border border-emerald-800/50 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-emerald-500/10 rounded-full">
          <svg
            className="w-6 h-6 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-emerald-400 mb-1">AI Insight</h3>
          <p className="text-slate-300">{insight}</p>
          {averageTemp && (
            <p className="text-sm text-emerald-500/80 mt-2">
              Average Temperature: {averageTemp.toFixed(1)}°C
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface WeatherLog {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  timestamp: number;
}

export const WeatherTable = ({ logs, loading }: { logs: WeatherLog[], loading?: boolean }) => {
  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100">
      <CardHeader>
        <CardTitle>Recent History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b [&_tr]:border-slate-800">
              <tr className="border-b transition-colors hover:bg-slate-800/50 data-[state=selected]:bg-slate-800">
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">Time</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">Condition</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">Temp</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">Humidity</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">Wind</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="p-4"><div className="h-4 w-16 bg-slate-800 animate-pulse rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-slate-800 animate-pulse rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-slate-800 animate-pulse rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-slate-800 animate-pulse rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-slate-800 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : (
                logs.slice(0, 5).map((log, i) => (
                  <tr key={i} className="border-b border-slate-800 transition-colors hover:bg-slate-800/50">
                    <td className="p-4 align-middle">{new Date(log.timestamp * 1000).toLocaleTimeString()}</td>
                    <td className="p-4 align-middle">{log.condition}</td>
                    <td className="p-4 align-middle">{log.temperature.toFixed(1)}°C</td>
                    <td className="p-4 align-middle">{log.humidity}%</td>
                    <td className="p-4 align-middle">{log.windSpeed} km/h</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
