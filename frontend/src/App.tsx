import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { Pokedex } from './pages/Pokedex';
import { PokemonDetails } from './pages/PokemonDetails';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Layout>
                <Users />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/pokedex" element={<PrivateRoute>
          <Layout>
            <Pokedex/>
          </Layout>
        </PrivateRoute>}/>
         <Route path="/pokemon/:id" element={<PrivateRoute>
          <Layout>
            <PokemonDetails/>
          </Layout>
        </PrivateRoute>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

