import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
