import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Code2,
  Container,
  Database,
  Server,
  Terminal,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header da Página */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Sobre o Projeto
            </h1>
            <p className="text-slate-500">
              Arquitetura, Decisões Técnicas e o Desenvolvedor
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
          </Button>
        </div>

        {/* Seção: O Desenvolvedor */}
        <Card className="border-l-4 border-l-blue-600 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">👨‍💻 O Desenvolvedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700 leading-relaxed">
            <p>
              Olá! Me chamo <strong>Gabriel Messias</strong>. Sou um
              Desenvolvedor Full Stack apaixonado por tecnologia e resolução de
              problemas.
            </p>
            <p>
              Minha trajetória é marcada por uma transição de carreira vinda da
              área de Radiologia. Essa bagagem me trouxe uma visão analítica
              aguçada e disciplina, características que hoje aplico na
              construção de software robusto e escalável.
            </p>
            <p>
              Atualmente curso{" "}
              <strong>Análise e Desenvolvimento de Sistemas</strong> e foco
              minhas especializações no ecossistema JavaScript (React, Angular, NestJS) e infraestrutura moderna.
            </p>
          </CardContent>
        </Card>

        {/* Seção: Arquitetura do Projeto */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Container className="w-5 h-5 text-slate-600" /> Arquitetura da
              Solução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-slate-600">
              Este projeto foi desenvolvido para demonstrar a integração de
              microsserviços heterogêneos rodando em contêineres Docker. O fluxo
              de dados segue o seguinte pipeline:
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-700">
                  <Terminal className="w-4 h-4 text-yellow-600" /> Python
                  (Coletor)
                </div>
                <p className="text-sm text-slate-500">
                  Consome a API Open-Meteo a cada 2 minutos e publica os dados
                  brutos em uma fila RabbitMQ.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-700">
                  <Code2 className="w-4 h-4 text-cyan-600" /> Go (Worker)
                </div>
                <p className="text-sm text-slate-500">
                  Consome a fila RabbitMQ em alta performance, processa a
                  mensagem e envia para a API via HTTP.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-700">
                  <Server className="w-4 h-4 text-red-600" /> NestJS (Backend)
                </div>
                <p className="text-sm text-slate-500">
                  Orquestra tudo. Gerencia usuários, autenticação JWT, gera
                  insights de IA, exporta Excel/CSV e integra com a PokéAPI.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-700">
                  <Database className="w-4 h-4 text-green-600" /> MongoDB
                </div>
                <p className="text-sm text-slate-500">
                  Armazenamento NoSQL persistente para logs de clima e dados de
                  usuários.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
