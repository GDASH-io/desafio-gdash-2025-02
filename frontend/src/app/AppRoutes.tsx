import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/login/page";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};
