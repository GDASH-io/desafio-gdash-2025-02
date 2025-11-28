import { useState } from "react";
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";

function App() {
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem("gdash_token")
  );

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("gdash_token", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("gdash_token");
  }

  // Roteamento simples
  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <DashboardPage token={token} onLogout={handleLogout} />;
}

export default App;