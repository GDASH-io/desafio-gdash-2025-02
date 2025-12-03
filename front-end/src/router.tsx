import { createBrowserRouter } from "react-router";
import { Home } from "./page/home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);
