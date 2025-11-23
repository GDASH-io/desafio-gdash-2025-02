import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SpacexDashboard } from "./components/SpacexDashboard";
import { WeatherDashboard } from "./components/WeatherDashboard";
import { Login } from "./pages/Login";
import "./styles/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<WeatherDashboard />} />

        <Route path="/spacex" element={<SpacexDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
