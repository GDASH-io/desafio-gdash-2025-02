import { createRoot } from 'react-dom/client'
import './index.css'
import Index from './index.tsx'
import { ThemeProvider } from './lib/theme.tsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Auth from './auth.tsx'
import Pokedex from './pokedex/pokedex.tsx';
import Pokemon from './pokedex/pokemon.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index/>,
  },{
    path: "/auth",
    element: <Auth/>,
  },{
    path: "/pokedex",
    element: <Pokedex/>,
  },{
    path: "/pokedex/:pokemon",
    element: <Pokemon/>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
)
