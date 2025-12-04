import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";

import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashboard";
import Api from "./pages/Api";
import PokemonPage from "./pages/PokemonPage";

export default function App() {
  return (
    <Routes>
      {/* Rotas sem layout*/}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pokemon" element={<PokemonPage />} />

      {/*Rotas com Layout*/}
      <Route element={<DashboardLayout />}>
        <Route path="/api" element={<Api />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
