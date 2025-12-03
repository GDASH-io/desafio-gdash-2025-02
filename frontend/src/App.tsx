import { Toaster } from "./components/ui/sonner";
import { Router } from "./Router";

function App() {
  return (
    <>
      <Router />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
