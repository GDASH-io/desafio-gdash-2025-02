import AppHeader from "@/components/layout/AppHeader";

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            Bem-vindo à tela Home 🚀
          </h2>
          <p className="text-slate-300">
            Aqui depois vamos colocar os gráficos e insights de clima.
          </p>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
