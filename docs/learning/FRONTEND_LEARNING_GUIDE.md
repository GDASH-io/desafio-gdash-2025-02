# Guia de Aprendizado: Frontend (React)

Este guia vai te ensinar como a "cara" do nosso projeto funciona. O Frontend é feito em **React**, uma biblioteca que permite criar sites como se estivéssemos montando peças de LEGO.

## 1. Peças de LEGO: Componentes (`App.tsx`)

No React, tudo é um **Componente**. Um botão é um componente, um menu é um componente, e a página inteira também.

```tsx
// App.tsx
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ... */}
      </Routes>
    </Router>
  );
}
```

*   **Função = Componente**: Veja que `App` é só uma função JavaScript que retorna algo que parece HTML.
*   **JSX**: Esse "HTML no meio do JavaScript" se chama JSX. É como descrevemos o que deve aparecer na tela.
*   **Composição**: O `App` usa outros componentes (`Router`, `Routes`, `Dashboard`) dentro dele. É um componente pai montando os filhos.

## 2. A Memória do Componente: Hooks (`useState`)

Componentes precisam lembrar das coisas (ex: "O usuário está logado?", "Quais são os dados do clima?"). Para isso usamos **Hooks**, funções especiais que começam com `use`.

```tsx
// Dashboard.tsx
const Dashboard = () => {
  // [variável, funçãoParaMudar] = useState(valorInicial)
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(true);
```

*   **`useState`**: Cria uma variável de estado.
    *   `logs`: É o valor atual.
    *   `setLogs`: É a função que usamos para atualizar o valor. Quando chamamos `setLogs`, o React redesenha a tela automaticamente com os novos dados!

## 3. O Ciclo de Vida: Efeitos (`useEffect`)

Às vezes queremos fazer algo automático quando a página carrega (ex: buscar dados). Usamos o `useEffect`.

```tsx
// Dashboard.tsx
useEffect(() => {
    fetchData(); // Busca os dados assim que a tela abre
    
    const interval = setInterval(fetchData, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval); // Limpeza quando sair da tela
}, []); // [] significa "rode apenas uma vez, no início"
```

*   **`useEffect`**: Diz ao React: "Faça isso depois de desenhar a tela".
*   **Array de Dependências `[]`**: Controla quando o efeito roda. Se estiver vazio, roda só na montagem do componente.

## 4. Buscando Dados (`fetchData` e `axios`)

O Frontend precisa pedir dados para o Backend. Usamos a biblioteca `axios`.

```tsx
const fetchData = async () => {
    try {
      // Faz uma chamada GET para o backend
      const response = await axios.get('http://localhost:3000/weather/logs');
      
      // Atualiza o estado com os dados recebidos
      setLogs(response.data);
    } catch (error) {
      console.error("Erro", error);
    }
};
```

*   **`async/await`**: Usamos para esperar a resposta do servidor sem travar a tela.
*   **Integração**: É aqui que o Frontend e o Backend se encontram.

## 5. Renderizando Listas e Condicionais

O React é ótimo para mostrar listas de dados.

```tsx
{/* Renderização Condicional */}
{loading ? (
  <DashboardSkeleton /> // Se estiver carregando, mostra esqueleto
) : (
  // Se carregou, mostra os gráficos
  <div className="grid...">
     {/* ... */}
  </div>
)}
```

## Resumo da Aula

*   **Componentes**: Blocos de construção (Funções que retornam JSX).
*   **JSX**: HTML dentro do JavaScript.
*   **useState**: Memória do componente.
*   **useEffect**: Ações automáticas (efeitos colaterais).
*   **Axios**: O mensageiro que busca dados no Backend.

Com isso, você entende como transformamos dados em telas bonitas! 🎨
