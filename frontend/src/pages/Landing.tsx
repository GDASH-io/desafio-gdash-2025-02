import { Link } from 'react-router-dom';
import { Cloud, BarChart3, Lightbulb, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

const weatherImages = [
  { title: 'Céu Aberto', image: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1200' },
  { title: 'Clima Chuvoso', image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1200' },
  { title: 'Parcialmente Nublado', image: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1200' },
  { title: 'Tempestade', image: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1200' },
];

export function Landing() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % weatherImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">GDASH Weather</span>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#sobre" className="text-sm hover:text-primary">Sobre</a>
          <a href="#documentacao" className="text-sm hover:text-primary">Documentação</a>
          <a href="#contato" className="text-sm hover:text-primary">Contato</a>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90">Entrar</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="mb-4 text-sm uppercase tracking-wider text-primary">
          Coleta inteligente de dados climáticos em tempo real
        </p>
        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
          Monitoramento<br />Climático com IA
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
          Sistema completo de coleta, processamento e análise de dados meteorológicos
          com insights gerados por Inteligência Artificial
        </p>

        {/* Feature Cards */}
        <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-slate-700 bg-slate-800/50 text-white">
            <CardHeader>
              <div className="mb-2 flex justify-center">
                <div className="rounded-lg bg-primary/20 p-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center text-lg">Coleta Automática</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Pipeline Python → RabbitMQ → Go para coleta contínua de dados climáticos
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 text-white">
            <CardHeader>
              <div className="mb-2 flex justify-center">
                <div className="rounded-lg bg-primary/20 p-3">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center text-lg">Insights de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Análise inteligente com previsões, tendências e alertas automáticos
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 text-white">
            <CardHeader>
              <div className="mb-2 flex justify-center">
                <div className="rounded-lg bg-primary/20 p-3">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center text-lg">Visualização Avançada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Dashboard interativo com gráficos e exportação em CSV/XLSX
              </p>
            </CardContent>
          </Card>
        </div>

        <Link to="/login">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Acessar Dashboard
          </Button>
        </Link>
      </section>

      {/* Carousel Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="mb-4 text-center text-3xl font-bold">Monitoramento em Tempo Real</h2>
        <p className="mb-12 text-center text-gray-400">Visualize diferentes condições climáticas</p>

        <div className="relative mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={weatherImages[currentImageIndex].image}
              alt={weatherImages[currentImageIndex].title}
              className="h-[400px] w-full object-cover transition-all duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h3 className="text-2xl font-bold">{weatherImages[currentImageIndex].title}</h3>
            </div>
          </div>

          {/* Indicators */}
          <div className="mt-6 flex justify-center gap-2">
            {weatherImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stack Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Stack Tecnológica</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="border-slate-700 bg-slate-800/50 text-white">
            <CardHeader><CardTitle className="text-center">Frontend</CardTitle></CardHeader>
            <CardContent><p className="text-center text-sm text-gray-400">React + Vite + Tailwind</p></CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50 text-white">
            <CardHeader><CardTitle className="text-center">Backend</CardTitle></CardHeader>
            <CardContent><p className="text-center text-sm text-gray-400">NestJS + MongoDB</p></CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50 text-white">
            <CardHeader><CardTitle className="text-center">Processamento</CardTitle></CardHeader>
            <CardContent><p className="text-center text-sm text-gray-400">Go + RabbitMQ</p></CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50 text-white">
            <CardHeader><CardTitle className="text-center">Coleta</CardTitle></CardHeader>
            <CardContent><p className="text-center text-sm text-gray-400">Python + APIs</p></CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="container mx-auto px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Contato</h2>
        <Card className="mx-auto max-w-2xl border-slate-700 bg-slate-800/50 text-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Felipe Loche</CardTitle>
            <p className="text-center text-sm text-gray-400">25 anos</p>
            <p className="text-center text-sm text-gray-400">
              Formado em Análise e Desenvolvimento de Sistemas pela UniSenai/SC
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href="https://linkedin.com/in/felipe-loche" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3 hover:bg-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-white">in</span>
              </div>
              <span>linkedin.com/in/felipe-loche</span>
            </a>
            <a href="https://github.com/felipeloche" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3 hover:bg-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-white">gh</span>
              </div>
              <span>github.com/felipeloche</span>
            </a>
            <a href="mailto:felipe.loche@hotmail.com"
               className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3 hover:bg-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-white">@</span>
              </div>
              <span>felipe.loche@hotmail.com</span>
            </a>
            <a href="tel:+5548996766527"
               className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3 hover:bg-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-white">☎</span>
              </div>
              <span>(48) 9 9676-6527</span>
            </a>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8">
        <p className="text-center text-sm text-gray-400">
          GDASH Weather Challenge 2025/02 - Sistema de Monitoramento Climático
        </p>
      </footer>
    </div>
  );
}