import AuthProvider from "./app/contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import Router from "./router";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center"/>
      <Router />
    </AuthProvider>
  );
}

export default App;
