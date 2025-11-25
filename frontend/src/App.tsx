import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-bg-light p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-8 font-heading">
          GDash - Weather Dashboard
        </h1>

        <div className="bg-bg-card border border-border rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-4 font-heading">
            Tailwind CSS Configurado
          </h2>
          <p className="text-text-secondary mb-4">
            O Tailwind CSS está configurado com as cores e fontes
            personalizadas.
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Contador: {count}
            </button>
            <button className="bg-secondary hover:bg-secondary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Botão Secundário
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary p-4 rounded-lg text-white text-center">
              <p className="text-sm font-medium">Primária</p>
              <p className="text-xs mt-1">#3B82F6</p>
            </div>
            <div className="bg-primary-dark p-4 rounded-lg text-white text-center">
              <p className="text-sm font-medium">Primária Escura</p>
              <p className="text-xs mt-1">#1E40AF</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg text-white text-center">
              <p className="text-sm font-medium">Secundária</p>
              <p className="text-xs mt-1">#10B981</p>
            </div>
            <div className="bg-text-secondary p-4 rounded-lg text-white text-center">
              <p className="text-sm font-medium">Texto Secundário</p>
              <p className="text-xs mt-1">#64748B</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-3 font-heading">
            Fontes Configuradas
          </h3>
          <p className="text-text-secondary">
            <span className="font-heading font-semibold">Inter</span> está
            configurada para headings e body text.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
