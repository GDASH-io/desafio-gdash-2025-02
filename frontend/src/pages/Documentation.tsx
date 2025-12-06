import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Documentation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Documentation</h1>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => navigate("/login")} className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-100">
              Login
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white">
              Go to Dashboard
            </Button>
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle>Architecture Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400">
              This application is a full-stack weather monitoring system composed of several microservices:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-slate-800 rounded-lg bg-slate-950/50">
                <h3 className="font-semibold mb-2 text-blue-400">Collector (Python)</h3>
                <p className="text-sm text-slate-500">
                  Fetches weather data from Open-Meteo API every hour and publishes it to RabbitMQ.
                </p>
              </div>

              <div className="p-4 border border-slate-800 rounded-lg bg-slate-950/50">
                <h3 className="font-semibold mb-2 text-orange-400">RabbitMQ</h3>
                <p className="text-sm text-slate-500">
                  Message broker that queues weather data for processing.
                </p>
              </div>

              <div className="p-4 border border-slate-800 rounded-lg bg-slate-950/50">
                <h3 className="font-semibold mb-2 text-cyan-400">Worker (Go)</h3>
                <p className="text-sm text-slate-500">
                  Consumes messages from RabbitMQ and posts them to the Backend API.
                </p>
              </div>

              <div className="p-4 border border-slate-800 rounded-lg bg-slate-950/50">
                <h3 className="font-semibold mb-2 text-red-400">Backend (NestJS)</h3>
                <p className="text-sm text-slate-500">
                  REST API that stores data in MongoDB and provides endpoints for the frontend.
                  Includes Swagger documentation at <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/docs`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">/api/docs</a>.
                </p>
              </div>

              <div className="p-4 border border-slate-800 rounded-lg bg-slate-950/50">
                <h3 className="font-semibold mb-2 text-green-400">Frontend (React)</h3>
                <p className="text-sm text-slate-500">
                  Interactive dashboard built with Vite, Tailwind CSS, and Recharts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-400">
              The backend provides a comprehensive Swagger UI for exploring the API endpoints.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/docs`} target="_blank" rel="noopener noreferrer">
                Open Swagger UI
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documentation;
