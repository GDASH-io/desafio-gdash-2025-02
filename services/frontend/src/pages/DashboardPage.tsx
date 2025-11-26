import { Download, TrendingUp, Droplets, Wind, Thermometer, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useWeatherData, useWeatherChartData, useWeatherInsights, useExportCSV, useExportXLSX } from '@/hooks/useWeather'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export const DashboardPage = () => {
  const { data: weatherData, isLoading: isLoadingWeather } = useWeatherData()
  const { data: chartData, isLoading: isLoadingChart } = useWeatherChartData()
  const { data: insights, isLoading: isLoadingInsights } = useWeatherInsights()
  const exportCSV = useExportCSV()
  const exportXLSX = useExportXLSX()
  const { toast } = useToast()

  const handleExportCSV = async () => {
    try {
      await exportCSV.mutateAsync()
      toast({
        title: 'Success!',
        description: 'Weather data exported to CSV',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: 'Failed to export data',
      })
    }
  }

  const handleExportXLSX = async () => {
    try {
      await exportXLSX.mutateAsync()
      toast({
        title: 'Success!',
        description: 'Weather data exported to Excel',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: 'Failed to export data',
      })
    }
  }

  if (isLoadingWeather || isLoadingChart || isLoadingInsights) {
    return <LoadingSpinner size="lg" />
  }

  const latestWeather = weatherData?.[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-hand text-primary">Weather Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time weather data and insights powered by AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={exportCSV.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportXLSX}
            disabled={exportXLSX.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Weather Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="sketch-card hover:shadow-sketch-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-hand">{latestWeather?.temperature || 0}°C</div>
            <p className="text-xs text-muted-foreground">Current temperature</p>
          </CardContent>
        </Card>

        <Card className="sketch-card hover:shadow-sketch-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-hand">{latestWeather?.humidity || 0}%</div>
            <p className="text-xs text-muted-foreground">Relative humidity</p>
          </CardContent>
        </Card>

        <Card className="sketch-card hover:shadow-sketch-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wind Speed</CardTitle>
            <Wind className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-hand">{latestWeather?.windSpeed || 0} km/h</div>
            <p className="text-xs text-muted-foreground">Current wind speed</p>
          </CardContent>
        </Card>

        <Card className="sketch-card hover:shadow-sketch-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Condition</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-hand">{latestWeather?.condition || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Weather condition</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="sketch-card">
          <CardHeader>
            <CardTitle className="font-hand">Temperature Over Time</CardTitle>
            <CardDescription>Historical temperature data</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#1DB954"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="sketch-card">
          <CardHeader>
            <CardTitle className="font-hand">Rain Probability</CardTitle>
            <CardDescription>Forecast rain probability</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rainProbability"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <Card className="sketch-card">
          <CardHeader>
            <CardTitle className="font-hand">AI Weather Insights</CardTitle>
            <CardDescription>Intelligent analysis of weather patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                    insight.type === 'alert'
                      ? 'bg-destructive/10 border-destructive'
                      : insight.type === 'warning'
                      ? 'bg-orange-500/10 border-orange-500'
                      : insight.type === 'success'
                      ? 'bg-primary/10 border-primary'
                      : 'bg-muted border-muted-foreground'
                  }`}
                >
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{insight.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(insight.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Data Table */}
      <Card className="sketch-card">
        <CardHeader>
          <CardTitle className="font-hand">Weather Records</CardTitle>
          <CardDescription>Recent weather data entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Humidity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weatherData?.slice(0, 10).map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.timestamp)}</TableCell>
                  <TableCell className="font-medium">{record.location}</TableCell>
                  <TableCell>{record.condition}</TableCell>
                  <TableCell>{record.temperature}°C</TableCell>
                  <TableCell>{record.humidity}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
