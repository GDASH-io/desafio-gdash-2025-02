import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Auth/Login"
import Dashboard from "./pages/Auth/Dashboard"
import Users from "./pages/Auth/Users"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/common/ProtectRoute"

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute component={Dashboard} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/users" element={<ProtectedRoute component={Users} />} />
        </Routes>
      </AuthProvider>
    </Router>
 )
}

export default App
