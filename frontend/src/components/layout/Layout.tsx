import { Footer } from "@/components/footer/Footer";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* O conteúdo da página cresce o quanto precisar */}
      <main className="flex-grow bg-gradient-to-br from-slate-50 to-slate-100">
        {children}
      </main>
      {/* Rodapé fixo */}
      <Footer />
    </div>
  );
}
