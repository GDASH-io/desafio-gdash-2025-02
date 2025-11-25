import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};
