import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, History, ChevronDown, ChevronUp, Download, Search, X, Sun, Moon, Wind, CloudRain, Cloud, ThermometerSun, ThermometerSnowflake, CloudSun } from "lucide-react";

import imgCalor from "@/assets/sol_quente.png";
import imgNormal from "@/assets/sol_normal.png";
import imgFrio from "@/assets/frio.png";
import imgChuva from "@/assets/chuva.png";
import imgNoite from "@/assets/noite.png";
import imgNoiteFria from "@/assets/noite_fria.png";
import imgPijama from "@/assets/pijama.png";

import { Login } from "./Login";
import { GestaoUsuarios } from "./GestaoUsuarios";

interface Clima {
  _id: string;
  temperatura: number;
  umidade: number;
  chuva: number;
  eh_dia: boolean;
  createdAt: string;
  insight: string;
  cidade: string;
  pais: string;
  temp_max: number;
  temp_min: number;
  velocidade_vento: number;
  condicao_ceu: number;
  probabilidade_chuva: number;
  hora_local?: string;
}

function App() {
  const [dados, setDados] = useState<Clima[]>([]);
  const [verHistorico, setVerHistorico] = useState(false);
  const [isLogado, setIsLogado] = useState(() => localStorage.getItem("auth") === "true");
  const [nomeUsuario, setNomeUsuario] = useState(() => localStorage.getItem("usuarioNome") || "Visitante");

  const [termoBusca, setTermoBusca] = useState("");
  const [dadosPesquisa, setDadosPesquisa] = useState<Clima | null>(null);
  const [filtroGrafico, setFiltroGrafico] = useState<1 | 3 | 6 | 12 | 24>(1);

  const atual = dadosPesquisa || dados[0] || {
    temperatura: 0, umidade: 0, chuva: 0, eh_dia: true, insight: "Carregando...", createdAt: new Date().toISOString(),
    temp_max: 0, temp_min: 0, velocidade_vento: 0, condicao_ceu: 0, probabilidade_chuva: 0, cidade: "...", pais: ""
  };

  const buscarDadosBackend = async () => {
    if (dadosPesquisa) return;
    try {
      const resposta = await fetch("http://localhost:3000/weather");
      const json = await resposta.json();
      const jsonComHora = json.map((item: any) => ({
        ...item,
        hora_local: new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));
      setDados(jsonComHora);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const realizarPesquisa = async () => {
    if (!termoBusca) return;
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${termoBusca}&count=1&language=pt&format=json`);
      const geoJson = await geoRes.json();

      if (!geoJson.results) {
        alert("Cidade não encontrada!");
        return;
      }

      const local = geoJson.results[0];

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,wind_speed_10m,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
      const wData = await weatherRes.json();

      const climaFake: Clima = {
        _id: "pesquisa",
        temperatura: wData.current.temperature_2m,
        umidade: wData.current.relative_humidity_2m,
        chuva: wData.current.precipitation,
        eh_dia: !!wData.current.is_day,
        createdAt: new Date().toISOString(),
        hora_local: wData.current.time.split("T")[1],
        insight: "Modo Pesquisa | Visualizando dados externos.",
        cidade: local.name,
        pais: local.country_code ? getFlagEmoji(local.country_code) : "",
        temp_max: wData.daily.temperature_2m_max[0],
        temp_min: wData.daily.temperature_2m_min[0],
        velocidade_vento: wData.current.wind_speed_10m,
        condicao_ceu: wData.current.cloud_cover,
        probabilidade_chuva: wData.daily.precipitation_probability_max[0]
      };

      setDadosPesquisa(climaFake);

    } catch (error) {
      console.error("Erro na pesquisa:", error);
      alert("Erro ao buscar cidade.");
    }
  };

  const limparPesquisa = () => {
    setDadosPesquisa(null);
    setTermoBusca("");
    buscarDadosBackend();
  };

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  useEffect(() => {
    if (isLogado) {
      buscarDadosBackend();
      const intervalo = setInterval(buscarDadosBackend, 5000);
      return () => clearInterval(intervalo);
    }
  }, [isLogado, dadosPesquisa]);

  const handleLogin = () => {
    localStorage.setItem("auth", "true");
    setIsLogado(true);
    setNomeUsuario(localStorage.getItem("usuarioNome") || "Visitante");
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("usuarioNome");
    setIsLogado(false);
  };

  const getPageBackground = () => {
    if (atual.chuva > 0) return "bg-slate-900";
    if (!atual.eh_dia) return "bg-slate-950";
    if (atual.temperatura > 28) return "bg-amber-50";
    return "bg-blue-100";
  };

  const renderCardPrincipal = () => {
    let textoStatus = "Analisando...";
    let cardGradient = "";
    let imagemFinal = imgNormal;

    let BackgroundIcon = Sun;
    let corBgIcon = "text-white/40";

    const dataColeta = new Date(atual.createdAt);
    const hora = dataColeta.getHours();
    let saudacao = `Olá, ${nomeUsuario}!`;

    if (hora >= 5 && hora < 12) saudacao = `Bom dia, ${nomeUsuario}!`;
    else if (hora >= 12 && hora < 18) saudacao = `Boa tarde, ${nomeUsuario}!`;
    else saudacao = `Boa noite, ${nomeUsuario}!`;

    if (dadosPesquisa) saudacao = "Modo Pesquisa 🌎";

    if (atual.chuva > 0) {
      textoStatus = "Chuvoso ☔";
      cardGradient = "bg-gradient-to-br from-slate-600 to-slate-800 border-slate-500";
      imagemFinal = imgChuva;
      BackgroundIcon = CloudRain;
      corBgIcon = "text-blue-300/50";
    }
    else if (!atual.eh_dia) {
      textoStatus = "Noite ✨";
      cardGradient = "bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-700";
      BackgroundIcon = Moon;
      corBgIcon = "text-yellow-100/30";
      if (hora >= 22 || hora < 6) imagemFinal = imgPijama;
      else imagemFinal = atual.temperatura < 18 ? imgNoiteFria : imgNoite;
    }
    else if (atual.temperatura > 28) {
      textoStatus = "Calor 😎";
      cardGradient = "bg-gradient-to-br from-orange-400 to-amber-500 border-orange-300";
      imagemFinal = imgCalor;
      BackgroundIcon = ThermometerSun;
      corBgIcon = "text-yellow-200/60"
    }
    else if (atual.temperatura < 18) {
      textoStatus = "Frio 🥶";
      cardGradient = "bg-gradient-to-br from-blue-400 to-cyan-300 border-blue-300";
      imagemFinal = imgFrio;
      BackgroundIcon = ThermometerSnowflake;
      corBgIcon = "text-white/50";
    }
    else {
      textoStatus = "Tempo Bom 🌤️";
      cardGradient = "bg-gradient-to-br from-sky-400 to-blue-500 border-sky-300";
      imagemFinal = imgNormal;
      BackgroundIcon = CloudSun;
      corBgIcon = "text-yellow-100/50";
    }

    return (
      <Card className={`flex flex-col items-center justify-center py-8 shadow-2xl text-white transition-all duration-1000 ${cardGradient} w-full lg:sticky lg:top-6 relative overflow-hidden`}>
        <div className="absolute top-4 right-4 pointer-events-none">
          <BackgroundIcon className={`h-24 w-24 ${corBgIcon} animate-pulse duration-[3000ms]`} />
        </div>
        <div className="absolute top-4 left-6 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm z-10">
          <span className="text-xs font-bold uppercase tracking-wide text-white/90">{saudacao}</span>
        </div>
        <div className="relative mb-6 mt-4 transform hover:scale-110 transition-transform duration-500">
          <img src={imagemFinal} alt="Ícone" className="w-56 h-56 object-contain drop-shadow-2xl filter" />
        </div>
        <h2 className="text-4xl font-bold drop-shadow-md mb-2">{textoStatus}</h2>
        <div className="px-6 py-2 rounded-full bg-black/20 backdrop-blur-sm mx-4">
          <p className="text-sm font-medium text-white/90 text-center">
            {atual.insight ? atual.insight.split('|')[1] : "Conectando satélite..."}
          </p>
        </div>
      </Card>
    );
  };

  const exportarCSV = () => {
    const headers = ["Data,Hora,Temperatura,Umidade,Vento,Chuva,Status"];
    const rows = dados.map(item => {
      const data = new Date(item.createdAt).toLocaleDateString('pt-BR');
      const hora = new Date(item.createdAt).toLocaleTimeString('pt-BR');
      const status = item.insight.replace(/,/g, ' -').split('|')[0];
      return `${data},${hora},${item.temperatura},${item.umidade},${item.velocidade_vento},${item.chuva},${status}`;
    });
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "relatorio_clima_gdash.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDadosGrafico = () => {
    if (dadosPesquisa) return [];
    const agora = new Date().getTime();
    const dadosFiltrados = dados.filter(d => {
      const tempoDado = new Date(d.createdAt).getTime();
      const diferencaHoras = (agora - tempoDado) / (1000 * 60 * 60);
      return diferencaHoras <= filtroGrafico;
    });
    return [...dadosFiltrados].reverse();
  };

  const dadosGrafico = getDadosGrafico();
  const listaParaMostrar = verHistorico ? dados.slice(0, 100) : dados.slice(0, 5);

  if (!isLogado) return <Login onLogin={handleLogin} />;

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans transition-colors duration-1000 ${getPageBackground()} overflow-x-hidden`}>
      <div className="mx-auto max-w-5xl space-y-8">


        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center md:justify-between text-white bg-white/10 p-4 rounded-xl backdrop-blur-sm">
          <div>
            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm ${atual.eh_dia && atual.chuva === 0 ? 'text-slate-800' : 'text-white'}`}>
              GDASH Clima <span className="text-blue-500">PRO</span>
            </h1>
            <div className={`mt-1 flex items-center gap-2 ${atual.eh_dia && atual.chuva === 0 ? 'text-slate-500' : 'text-white/80'}`}>
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{atual.cidade || "Localizando..."}</span>
              <span className="text-lg leading-none">{atual.pais || ""}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Pesquisar cidade..."
                className="pl-4 pr-10 text-black bg-white/90 border-none w-full"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && realizarPesquisa()}
              />
              {dadosPesquisa ? (
                <X className="absolute right-2 top-2.5 h-5 w-5 text-slate-400 cursor-pointer hover:text-red-500" onClick={limparPesquisa} />
              ) : (
                <Search className="absolute right-2 top-2.5 h-5 w-5 text-slate-400 cursor-pointer" onClick={realizarPesquisa} />
              )}
            </div>
            <Button variant="destructive" className="w-full md:w-auto hover:bg-red-500" onClick={handleLogout}>Sair</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <div className="w-full lg:col-span-1">
            {renderCardPrincipal()}
          </div>

          <div className="space-y-6 w-full lg:col-span-2">

            <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">

              <Card className="bg-white/90 border-none shadow-lg hover:shadow-xl transition-shadow flex flex-col relative overflow-hidden">
                <div className="absolute right-2 top-2 opacity-20 pointer-events-none">
                  {atual.eh_dia ? (
                    <Sun className="h-16 w-16 text-amber-400 animate-pulse" />
                  ) : (
                    <Moon className="h-16 w-16 text-indigo-300 animate-pulse" />
                  )}
                </div>

                <CardHeader className="p-3 md:p-4 pb-2 relative z-10">
                  <CardTitle className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Temperatura</CardTitle>
                </CardHeader>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full w-16  text-slate-600">
                  🕒 {atual.hora_local || "--:--"}
                </span>
                <CardContent className="p-3 md:p-4 pt-0 flex-1 flex flex-col justify-end relative z-10">
                  <div className="text-lg md:text-xl font-bold text-slate-800">{atual.temperatura}°C</div>
                  <div className="text-[10px] text-slate-500 flex flex-wrap gap-2 mt-1 font-medium">
                    <span className="text-red-500 bg-red-50 px-1 rounded">Max: {atual.temp_max}°</span>
                    <span className="text-blue-500 bg-blue-50 px-1 rounded">Min: {atual.temp_min}°</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 border-none shadow-lg hover:shadow-xl transition-shadow flex flex-col relative overflow-hidden">
                <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none">
                  <Wind className="h-24 w-24 text-slate-600 animate-pulse duration-[3000ms]" />
                </div>

                <CardHeader className="p-3 md:p-4 pb-2 relative z-10">
                  <CardTitle className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Vento</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0 flex-1 flex flex-col justify-end relative z-10">
                  <div className="text-lg md:text-xl font-bold text-slate-800">{atual.velocidade_vento} km/h</div>
                  <div className="text-[13px] text-slate-500 mt-1 truncate font-medium">
                    {atual.velocidade_vento > 20 ? "Forte 💨" : "Leve 🍃"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 border-none shadow-lg hover:shadow-xl transition-shadow flex flex-col relative overflow-hidden">
                <div className="absolute right-2 top-2 opacity-15 pointer-events-none">
                  <CloudRain className="h-16 w-16 text-blue-400 animate-pulse" />
                </div>

                <CardHeader className="p-3 md:p-4 pb-2 relative z-10">
                  <CardTitle className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Umidade</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0 flex-1 flex flex-col justify-end relative z-10">
                  <div className="text-lg md:text-xl font-bold text-slate-800">{atual.umidade}%</div>
                  <div className="text-[10px] text-blue-600 mt-1 font-medium bg-blue-50 px-1 rounded w-fit">
                    {atual.probabilidade_chuva}% chuva
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 border-none shadow-lg hover:shadow-xl transition-shadow flex flex-col relative overflow-hidden">
                <div className="absolute right-[-5px] top-[-5px] opacity-10 pointer-events-none">
                  {atual.condicao_ceu < 20 ? (
                    <Sun className="h-20 w-20 text-orange-400 animate-pulse duration-[4000ms]" />
                  ) : (
                    <Cloud className="h-20 w-20 text-slate-700 animate-pulse duration-[4000ms]" />
                  )}
                </div>

                <CardHeader className="p-3 md:p-4 pb-2 relative z-10">
                  <CardTitle className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Cobertura</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0 flex-1 flex flex-col justify-end relative z-10">
                  <div className="text-lg md:text-xl font-bold text-slate-800">{atual.condicao_ceu}%</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">
                    {atual.condicao_ceu < 20 ? "Céu Limpo" : "Nublado"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-lg bg-white/95 overflow-hidden">
              <CardHeader className="p-4 pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <CardTitle className="text-base text-slate-700">Variação de Temperatura</CardTitle>
                <div className="flex gap-1">
                  {[1, 3, 6, 12, 24].map((hora) => (
                    <Button key={hora} variant={filtroGrafico === hora ? "default" : "outline"} size="sm" className="h-6 text-[10px] hover:bg-slate-300 px-2" onClick={() => setFiltroGrafico(hora as any)}>{hora}h</Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-4 h-[200px]">
                {dadosPesquisa ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Gráfico indisponível na pesquisa</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dadosGrafico}>
                      <defs><linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="createdAt" tickFormatter={(str) => new Date(str).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} unit="°C" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none' }} labelFormatter={(label) => new Date(label).toLocaleTimeString('pt-BR')} />
                      <Area type="monotone" dataKey="temperatura" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {!dadosPesquisa && (
              <Card className="overflow-hidden border-none shadow-lg bg-white/95">
                <CardHeader className="bg-slate-50/50 border-b flex flex-col md:flex-row items-start md:items-center justify-between py-3 gap-2">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-base text-slate-700 flex items-center gap-2"><History className="h-4 w-4" /> Histórico</CardTitle>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-slate-600 hover:text-blue-600 hover:bg-slate-200" onClick={exportarCSV}><Download className="h-3 w-3" /> CSV</Button>
                  </div>
                  <span className="text-xs text-slate-400">{verHistorico ? "100 registros" : "Últimos 5"}</span>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Horário</TableHead>
                        <TableHead>Temp.</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listaParaMostrar.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell className="font-medium text-slate-600">
                            <div className="flex flex-col"><span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span><span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleTimeString('pt-BR')}</span></div>
                          </TableCell>
                          <TableCell><span className={item.temperatura > 30 ? "text-orange-500 font-bold" : "text-slate-700"}>{item.temperatura}°C</span></TableCell>
                          <TableCell className="text-xs text-slate-500 max-w-[150px] md:max-w-[200px] truncate">{item.insight ? item.insight.split('|')[0] : "Analisando..."}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-2 bg-slate-50/50 border-t">
                    <Button variant="ghost" className="w-full text-slate-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => setVerHistorico(!verHistorico)}>
                      {verHistorico ? <span className="flex items-center gap-2">Recolher <ChevronUp className="h-4 w-4" /></span> : <span className="flex items-center gap-2">Ver Completo (+{dados.length > 5 ? dados.length - 5 : 0}) <ChevronDown className="h-4 w-4" /></span>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <GestaoUsuarios />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;