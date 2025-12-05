import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotFound } from './components/NotFound'
import { lazy } from 'react'

const LoginPage = lazy(() =>
  import("./pages/login").then(module => ({ default: module.LoginPage }))
);
const SignupPage = lazy(() =>
  import("./pages/signup").then(module => ({ default: module.SignupPage }))
);
const RequireAuth = lazy(() =>
  import("./components/RequireAuth").then(module => ({ default: module.RequireAuth }))
);
const AuthLoader = lazy(() =>
  import("./components/AuthLoader").then(module => ({ default: module.AuthLoader }))
);
const DashBoard = lazy(() =>
  import("./pages/dashBoard").then(module => ({ default: module.DashBoard }))
);

const queryClient = new QueryClient()
function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
            <Route element={<RequireAuth />}>
              <Route path='dashboard/*' element={
                <AuthLoader>
                  <DashBoard />
                </AuthLoader>
              } />
            </Route>
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
      <Toaster richColors={true} />
    </>
  )
}

export default App