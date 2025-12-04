import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import PokemonList from "../pages/PokemonList";
import Navbar from "../components/Navbar";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <div>
              <Navbar />
              <Dashboard />
            </div>
          }
        />
        <Route
          path="/pokemons"
          element={
            <div>
              <Navbar />
              <PokemonList />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
