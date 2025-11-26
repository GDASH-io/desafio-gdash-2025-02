import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Auth/Login"
import Dashboard from "./pages/Auth/Dashboard"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/common/ProtectRoute"

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
        </Routes>
      </AuthProvider>
    </Router>
 )
}

export default App
