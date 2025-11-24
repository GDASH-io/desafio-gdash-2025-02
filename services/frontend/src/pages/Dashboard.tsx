import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Bem-vindo, {user?.name}!
      </p>
      <div className="mt-8 p-6 border rounded-lg bg-card">
        <p className="text-sm text-muted-foreground">
          Dashboard em construção... 🚧
        </p>
      </div>
    </div>
  );
}
