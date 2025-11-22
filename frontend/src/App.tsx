import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WeatherDashboard } from "./components/WeatherDashboard";
import { Login } from "./pages/Login";
import "./styles/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<WeatherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
