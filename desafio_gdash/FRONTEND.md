# 🌦️ Weather Dashboard - Frontend React

Dashboard interativo desenvolvido em **React + Vite + Tailwind CSS + Recharts** para visualização de dados climáticos em tempo real.

---

## 📸 **Preview**

### Dashboard Principal

- **Condições Atuais**: Card grande com temperatura, umidade, vento e condição climática
- **Estatísticas**: Cards com métricas (total de registros, médias, tendências)
- **Gráfico Histórico**: Gráfico de linhas com temperatura e umidade das últimas 20 medições
- **Tabela de Dados**: Histórico dos últimos 10 registros em formato de tabela

---

## 🏗️ **Arquitetura**

```
src/
├── components/
│   ├── ui/
│   │   └── card.jsx              # Componentes shadcn/ui Card
│   ├── WeatherCard.jsx           # Card de condições atuais
│   ├── TemperatureChart.jsx      # Gráfico histórico (Recharts)
│   └── Statistics.jsx            # Cards de estatísticas
├── services/
│   └── weatherService.js         # Serviço Axios para API
├── App.jsx                       # Componente principal
└── main.jsx                      # Entry point
```

---

## 🚀 **Funcionalidades**

### **1. Monitoramento em Tempo Real**

- ✅ Auto-refresh a cada 30 segundos
- ✅ Botão de atualização manual
- ✅ Timestamp da última atualização
- ✅ Indicador de status da coleta (ativo/inativo)

### **2. Visualização de Dados**

- ✅ Card grande com condições climáticas atuais
- ✅ Estatísticas calculadas (médias, tendências)
- ✅ Gráfico interativo com Recharts
- ✅ Tabela responsiva com últimos 10 registros

---

## 🎨 **Tecnologias**

| Tecnologia       | Versão  | Uso                         |
| ---------------- | ------- | --------------------------- |
| **React**        | 19.2.0  | Biblioteca UI com hooks     |
| **Vite**         | 7.2.2   | Build tool (HMR, ESM)       |
| **Tailwind CSS** | 3.4.18  | Utility-first CSS framework |
| **Recharts**     | 2.x     | Gráficos interativos        |
| **Axios**        | 1.x     | Cliente HTTP para API       |
| **date-fns**     | 3.x     | Formatação de datas         |
| **Lucide React** | 0.554.0 | Ícones modernos             |

---

## 🔧 **Configuração**

### **1. Instalar Dependências**

```bash
cd desafio_gdash
npm install
```

### **2. Configurar Variáveis de Ambiente**

```env
VITE_API_URL=http://localhost:3000
```

### **3. Iniciar Servidor de Desenvolvimento**

```bash
npm run dev
```

Acesse: **http://localhost:5173**

---

## 📡 **Integração com API**

### **Endpoints Consumidos:**

- `GET /api/weather/stats` → Estatísticas gerais
- `GET /api/weather/recent?hours=24` → Últimas 24 horas

---

## 🎯 **Componentes**

### **WeatherCard**

Exibe condições climáticas atuais com ícones e cores dinâmicas.

### **TemperatureChart**

Gráfico de linhas com duplo eixo Y (temperatura + umidade).

### **Statistics**

Cards de métricas com cálculo de médias e tendências.

---

## 🧠 **Conceitos React**

- **useState**: Gerenciamento de estado
- **useEffect**: Fetch inicial + auto-refresh
- **Promise.all**: Requisições paralelas
- **Conditional Rendering**: Loading/Error states

---

## 🚧 **Próximos Passos**

1. ✅ Dashboard funcionando
2. ⏳ Exportação CSV/XLSX
3. ⏳ Filtros de Data
4. ⏳ Dark Mode Toggle
5. ⏳ PWA (offline-first)

---

**Desenvolvido como parte do desafio GDash** 🚀  
**Stack**: Python → RabbitMQ → Go → NestJS → MongoDB → **React**
