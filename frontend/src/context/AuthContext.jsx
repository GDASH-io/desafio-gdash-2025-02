import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token }); 
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const res = await apiRequest("/auth/login", "POST", { email, password });
    localStorage.setItem("token", res.token);
    setUser(res.user);
    navigate("/dashboard");
  }

  async function register(name, email, password) {
    await apiRequest("/auth/register", "POST", { name, email, password });
    navigate("/");
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
