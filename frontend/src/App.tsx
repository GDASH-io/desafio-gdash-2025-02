import { Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/protectedRoute";
import DashboardPage from "./pages/dashboardPage";
import LoginPage from "./pages/loginPage";
import { UsersProvider } from "./context/userProvider";
import UsersPage from "./pages/usersPage";
import { SwapiProvider } from "./context/swapiProvider";
import ExplorePage from "./pages/explorePage";
import { WeatherProvider } from "./context/weatherProvider";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <UsersProvider>
              <WeatherProvider>
                <DashboardPage />
              </WeatherProvider>
            </UsersProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UsersProvider>
              <WeatherProvider>
                <DashboardPage />
              </WeatherProvider>
            </UsersProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersProvider>
              <UsersPage />
            </UsersProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/explorar"
        element={
          <ProtectedRoute>
            <SwapiProvider>
              <ExplorePage />
            </SwapiProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
