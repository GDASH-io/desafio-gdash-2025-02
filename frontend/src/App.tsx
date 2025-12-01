import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import { Toaster } from "./components/ui/sonner";
import { ProtectedRoute, PublicRoute } from "./routes/ProtectedRoute";
import StarWarsPage from "./pages/StartWarsPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

          <Route
          path="/star-wars"
          element={
            <ProtectedRoute>
              <StarWarsPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster position="top-center" />
    </BrowserRouter>
  );
};

export default App;
