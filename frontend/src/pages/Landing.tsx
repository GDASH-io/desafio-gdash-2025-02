import { Link } from 'react-router-dom';
import { BarChart3, Lightbulb, Droplets, ChevronLeft, ChevronRight, Linkedin, Github, Mail, Smartphone } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white scroll-smooth">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-0">
          <img
            src="/IconWeAIther.png"
            alt="WeAIther Icon"
            className="h-16"
          />
          <img
            src="/LogoWeAIther.png"
            alt="WeAIther Logo"
            className="h-24"
          />
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#sobre" className="text-sm transition-colors hover:text-cyan-400">Sobre</a>
          <a href="#documentacao" className="text-sm transition-colors hover:text-cyan-400">Documentação</a>
          <a href="#contato" className="text-sm transition-colors hover:text-cyan-400">Contato</a>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90">Entrar</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="sobre" className="container mx-auto px-6 py-20 text-center">
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
          {/* Seta Esquerda */}
          <button
            onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? weatherImages.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:bg-white hover:scale-110"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-6 w-6 text-cyan-600" />
          </button>

          <div className="relative overflow-hidden rounded-2xl border border-slate-700 shadow-2xl">
            <img
              src={weatherImages[currentImageIndex].image}
              alt={weatherImages[currentImageIndex].title}
              className="h-[500px] w-full object-cover transition-all duration-500 ease-in-out"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-8">
              <h3 className="text-3xl font-bold text-white">{weatherImages[currentImageIndex].title}</h3>
            </div>
          </div>

          {/* Seta Direita */}
          <button
            onClick={() => setCurrentImageIndex((prev) => (prev === weatherImages.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:bg-white hover:scale-110"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-6 w-6 text-cyan-600" />
          </button>

          {/* Indicators - Bullets Clicáveis */}
          <div className="mt-6 flex justify-center gap-2">
            {weatherImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-3 cursor-pointer rounded-full transition-all ${
                  index === currentImageIndex ? 'w-8 bg-primary' : 'w-3 bg-gray-400 hover:bg-gray-300'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stack Section */}
      <section id="documentacao" className="container mx-auto px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Stack Tecnológica</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="border-2 border-primary bg-slate-800/50 text-white shadow-lg transition-shadow hover:shadow-primary/20">
            <CardHeader><CardTitle className="text-center">Frontend</CardTitle></CardHeader>
            <CardContent><p className="text-center text-sm text-gray-400">React + Vite + Tailwind</p></CardContent>
          </Card>
          <Card className="border-2 border-primary bg-slate-800/50 text-white shadow-lg transition-shadow hover:shadow-primary/20">
            <CardHeader><CardTitle className="text-center">Backend</CardTitle></CardHeader>
            <CardContent><p className="text-center text-sm text-gray-400">NestJS + MongoDB</p></CardContent>
          </Card>
          <Card className="border-2 border-primary bg-slate-800/50 text-white shadow-lg transition-shadow hover:shadow-primary/20">
            <CardHeader><CardTitle className="text-center">Processamento</CardTitle></CardHeader>
            <CardContent><p className="text-center text-sm text-gray-400">Go + RabbitMQ</p></CardContent>
          </Card>
          <Card className="border-2 border-primary bg-slate-800/50 text-white shadow-lg transition-shadow hover:shadow-primary/20">
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
               className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3 transition-all hover:bg-slate-700 hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Linkedin className="h-6 w-6 text-white" />
              </div>
              <span>linkedin.com/in/felipe-loche</span>
            </a>
            <a href="https://github.com/felipeloche" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3 transition-all hover:bg-slate-700 hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Github className="h-6 w-6 text-white" />
              </div>
              <span>github.com/felipeloche</span>
            </a>
            <a href="mailto:felipe.loche@hotmail.com"
               className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3 transition-all hover:bg-slate-700 hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <span>felipe.loche@hotmail.com</span>
            </a>
            <a href="tel:+5548996766527"
               className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3 transition-all hover:bg-slate-700 hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <span>(48) 9 9676-6527</span>
            </a>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8">
        <p className="text-center text-sm text-gray-400">
          WeAIther - Weather Monitoring with AI | Desenvolvido para GDASH 2025/02
        </p>
      </footer>
    </div>
  );
}