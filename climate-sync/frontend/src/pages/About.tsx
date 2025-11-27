import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Lightbulb, Zap, CheckCircle2 } from "lucide-react";

const About = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">O Desafio & Solução</h1>
        <p className="text-muted-foreground">
          Uma demonstração técnica de arquitetura distribuída e integração de sistemas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* The Challenge */}
        <Card className="md:col-span-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">O Desafio Técnico</CardTitle>
            </div>
            <CardDescription className="text-base">
              Desenvolver uma aplicação Full Stack moderna, resiliente e escalável para monitoramento climático.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed">
              O objetivo principal foi criar um ecossistema completo que simula um cenário real de IoT e Big Data. 
              O sistema precisava coletar dados de fontes externas, processá-los de forma assíncrona e apresentá-los 
              em um dashboard interativo, tudo isso orquestrado via Docker.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-background">Alta Disponibilidade</Badge>
              <Badge variant="outline" className="bg-background">Processamento Assíncrono</Badge>
              <Badge variant="outline" className="bg-background">Inteligência Artificial</Badge>
            </div>
          </CardContent>
        </Card>

        {/* The Solution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle>A Solução</CardTitle>
            </div>
            <CardDescription>Arquitetura orientada a eventos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Para atender aos requisitos de performance e desacoplamento, adotei uma arquitetura de microsserviços. 
              A coleta de dados é isolada em Python, garantindo flexibilidade para lidar com diferentes fontes de dados.
            </p>
            <p>
              O uso de <strong>RabbitMQ</strong> como message broker garante que nenhum dado seja perdido, mesmo em picos de tráfego, 
              enquanto o worker em <strong>Go</strong> processa essas mensagens com extrema eficiência antes de persistir no MongoDB.
            </p>
          </CardContent>
        </Card>

        {/* Key Highlights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <CardTitle>Destaques Técnicos</CardTitle>
            </div>
            <CardDescription>Diferenciais implementados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
              <p className="text-sm"><strong>IA Generativa:</strong> Integração com Gemini para gerar insights climáticos contextualizados em linguagem natural.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
              <p className="text-sm"><strong>Real-time:</strong> Atualização instantânea do dashboard via Server-Sent Events (SSE) ou Polling otimizado.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
              <p className="text-sm"><strong>DX (Developer Experience):</strong> Configuração completa com Docker Compose e tipagem estrita com TypeScript.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
