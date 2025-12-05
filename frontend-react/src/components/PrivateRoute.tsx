import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('access_token');

  // Se não tem token, redireciona para login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se tem token, mostra o dashboard
  return children;
}

export default PrivateRoute;