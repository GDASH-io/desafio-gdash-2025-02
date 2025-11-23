import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SpacexDashboard } from "./components/SpacexDashboard";
import { UsersDashboard } from "./components/UsersDashboard";
import { WeatherDashboard } from "./components/WeatherDashboard";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Login } from "./pages/Login";
import "./styles/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <WeatherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/spacex"
          element={
            <ProtectedRoute>
              <SpacexDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
