import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/">
        <h1 className="text-2xl font-bold text-blue-500">GDASH</h1>
      </Link>
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link to="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
              <Button variant="ghost">Painel</Button>
            </Link>
          </li>
          <li>
            <Link to="/movies" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
              <Button variant="ghost">Filmes</Button>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
