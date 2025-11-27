import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Layout } from "./components/layout/Layout";
import AboutPage from "./pages/AboutPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PokemonPage from "./pages/PokemonPage";
import UsersPage from "./pages/UsersPage";

const Router = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  const path = window.location.pathname;

  if (!isAuthenticated) return <LoginPage />;

  if (path === "/users")
    return (
      <Layout>
        <UsersPage />
      </Layout>
    );
  if (path === "/pokemon")
    return (
      <Layout>
        <PokemonPage />
      </Layout>
    );
  if (path === "/about")
    return (
      <Layout>
        <AboutPage />
      </Layout>
    ); // <--- Nova Rota

  return (
    <Layout>
      <DashboardPage />
    </Layout>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
