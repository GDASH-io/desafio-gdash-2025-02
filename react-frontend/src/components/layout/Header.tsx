import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <Link to="/">
        <h1 className="text-2xl font-bold">GDASH</h1>
      </Link>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </li>
          <li>
            <Link to="/movies">
              <Button variant="ghost">Movies</Button>
            </Link>
          </li>
          <li>
            <Link to="/users">
              <Button variant="ghost">Users</Button>
            </Link>
          </li>
          <li>
            <Button variant="ghost">Login</Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
