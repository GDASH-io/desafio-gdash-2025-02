import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { Login } from "./pages/Login/Login";
import { Toaster } from "sonner";

// Páginas e Layouts
import Dashboard from "./pages/Dashboard/Dashboard";
import { MainLayout } from "./layouts/MainLayout"; // Importar o Layout
import UserManagement from "./pages/Users/UserManagement";
import StarWarsPage from "./pages/StarWars/StarWars";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />

        {/* ROTAS PROTEGIDAS + LAYOUT */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Dashboard na raiz (/) para alinhar com o menu */}
          <Route path="/" element={<Dashboard />} />

          {/* Nova página de Usuários */}
          <Route path="/users" element={<UserManagement />} />

          {/* Nova página de Star Wars Ships */}
          <Route path="/star-wars" element={<StarWarsPage />} />

          {/* Redirecionamento de compatibilidade (caso acesse /dashboard manualmente) */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Route>

        {/* Redirecionamento Padrão (404) vai para a home autenticada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}

export default App;
