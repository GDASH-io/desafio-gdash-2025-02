import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from "./pages/UsersPage";
import { ExplorePage } from "./pages/ExplorePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/explorar" element={<ExplorePage />} />

    </Routes>
  );
}
