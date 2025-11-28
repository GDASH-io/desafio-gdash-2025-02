import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/login/page";
import { WeatherPage } from "../pages/weather/page";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/weather" element={<WeatherPage />} />
      </Routes>
    </BrowserRouter>
  );
};
