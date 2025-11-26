import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="bg-background text-foreground p-4 flex justify-between items-center">
      <Link to="/">
        <h1 className="text-2xl font-bold text-primary">GDASH</h1>
      </Link>
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors duration-200">
              <Button variant="ghost">Painel</Button>
            </Link>
          </li>
          <li>
            <Link to="/movies" className="text-foreground hover:text-primary transition-colors duration-200">
              <Button variant="ghost">Filmes</Button>
            </Link>
          </li>
          <li>
            <Link to="/logs" className="text-foreground hover:text-primary transition-colors duration-200">
              <Button variant="ghost">Logs</Button>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
