import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Server, Database, Cloud, Code, Layout, Cpu, ArrowRight, Layers } from "lucide-react";

const Architecture = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Arquitetura & Stack</h1>
        <p className="text-muted-foreground">
          Detalhes técnicos das escolhas arquiteturais e tecnologias empregadas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Stack Overview */}
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle>Tech Stack Escolhida</CardTitle>
            </div>
            <CardDescription>Seleção de tecnologias baseada em performance, escalabilidade e manutenibilidade.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg dark:bg-slate-900">
                <div className="font-semibold flex items-center gap-2 text-primary">
                  <Layout className="h-4 w-4" /> Frontend
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-start">React + Vite</Badge>
                  <p className="text-xs text-muted-foreground">SPA rápida e moderna.</p>
                  <Badge variant="secondary" className="w-full justify-start">Tailwind CSS</Badge>
                  <p className="text-xs text-muted-foreground">Estilização utilitária.</p>
                  <Badge variant="secondary" className="w-full justify-start">shadcn/ui</Badge>
                  <p className="text-xs text-muted-foreground">Componentes acessíveis.</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-slate-50 rounded-lg dark:bg-slate-900">
                <div className="font-semibold flex items-center gap-2 text-primary">
                  <Server className="h-4 w-4" /> Backend API
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-start">NestJS</Badge>
                  <p className="text-xs text-muted-foreground">Framework robusto e modular.</p>
                  <Badge variant="secondary" className="w-full justify-start">TypeScript</Badge>
                  <p className="text-xs text-muted-foreground">Segurança de tipos.</p>
                  <Badge variant="secondary" className="w-full justify-start">JWT Auth</Badge>
                  <p className="text-xs text-muted-foreground">Autenticação stateless.</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-slate-50 rounded-lg dark:bg-slate-900">
                <div className="font-semibold flex items-center gap-2 text-primary">
                  <Cpu className="h-4 w-4" /> Microservices
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-start">Python</Badge>
                  <p className="text-xs text-muted-foreground">Coleta de dados e scripts.</p>
                  <Badge variant="secondary" className="w-full justify-start">Go (Golang)</Badge>
                  <p className="text-xs text-muted-foreground">Worker de alta performance.</p>
                  <Badge variant="secondary" className="w-full justify-start">RabbitMQ</Badge>
                  <p className="text-xs text-muted-foreground">Mensageria confiável.</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-slate-50 rounded-lg dark:bg-slate-900">
                <div className="font-semibold flex items-center gap-2 text-primary">
                  <Database className="h-4 w-4" /> Dados
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-start">MongoDB</Badge>
                  <p className="text-xs text-muted-foreground">Flexibilidade de schema.</p>
                  <Badge variant="secondary" className="w-full justify-start">Docker</Badge>
                  <p className="text-xs text-muted-foreground">Containerização total.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Pipeline Visual */}
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <CardTitle>Pipeline de Dados</CardTitle>
            </div>
            <CardDescription>Fluxo completo da informação: da coleta à visualização.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-slate-50 rounded-xl dark:bg-slate-900/50">
              
              <div className="flex flex-col items-center text-center space-y-2 max-w-[150px]">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/30">
                  <Cloud className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm">Coleta (Python)</span>
                <span className="text-xs text-muted-foreground">Busca dados em APIs externas</span>
              </div>

              <ArrowRight className="hidden md:block text-muted-foreground/50" />
              <div className="md:hidden h-8 w-px bg-muted-foreground/20" />

              <div className="flex flex-col items-center text-center space-y-2 max-w-[150px]">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-full dark:bg-orange-900/30">
                  <Layers className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm">Fila (RabbitMQ)</span>
                <span className="text-xs text-muted-foreground">Bufferização segura</span>
              </div>

              <ArrowRight className="hidden md:block text-muted-foreground/50" />
              <div className="md:hidden h-8 w-px bg-muted-foreground/20" />

              <div className="flex flex-col items-center text-center space-y-2 max-w-[150px]">
                <div className="p-3 bg-cyan-100 text-cyan-600 rounded-full dark:bg-cyan-900/30">
                  <Cpu className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm">Worker (Go)</span>
                <span className="text-xs text-muted-foreground">Processamento rápido</span>
              </div>

              <ArrowRight className="hidden md:block text-muted-foreground/50" />
              <div className="md:hidden h-8 w-px bg-muted-foreground/20" />

              <div className="flex flex-col items-center text-center space-y-2 max-w-[150px]">
                <div className="p-3 bg-red-100 text-red-600 rounded-full dark:bg-red-900/30">
                  <Server className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm">API (NestJS)</span>
                <span className="text-xs text-muted-foreground">Persistência e IA</span>
              </div>

              <ArrowRight className="hidden md:block text-muted-foreground/50" />
              <div className="md:hidden h-8 w-px bg-muted-foreground/20" />

              <div className="flex flex-col items-center text-center space-y-2 max-w-[150px]">
                <div className="p-3 bg-green-100 text-green-600 rounded-full dark:bg-green-900/30">
                  <Layout className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm">Frontend</span>
                <span className="text-xs text-muted-foreground">Dashboard Interativo</span>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Architecture;
