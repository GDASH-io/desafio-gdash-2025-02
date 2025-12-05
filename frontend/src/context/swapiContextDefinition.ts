import { createContext } from "react";
import type { ISwapiContext } from "../interfaces/swapi.interface";

export const SwapiContext = createContext<ISwapiContext | undefined>(undefined);
