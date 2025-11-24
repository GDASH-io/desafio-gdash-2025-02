export function Users() {
  return (
    <div className="min-h-screen -m-6 md:-m-8 p-6 md:p-8" style={{ background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(224 231 255))' }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
          <p className="text-center text-muted-foreground">
            CRUD de usuários em construção... 🚧
          </p>
        </div>
      </div>
    </div>
  );
}
